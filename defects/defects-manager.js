'use strict';
const _ = require('lodash');
const nodePersist = require('node-persist');
const octaneDataProvider = require('../octane/octane-data-provider');
const tagsManager = require('../tags/tags-manager');
const helper = require('../helper/helper');
const checkersConfig = require('../config/checks-config');

let defects = {};

function ensureDefect(id, d) {
	if (!defects[id]) {
		defects[id] = {
			d: d,
			curTags: [],
			newTags: [],
			anomalies: []
		};
	} else {
		if (!defects[id].d && d) {
			defects[id].d = d;
		}
	}
	return defects[id];
}

function checkForAnomalies() {
	return new Promise((resolve, reject) => {
		helper.logMessage('Retrieving defects...');
		octaneDataProvider.getLastDefects(checkersConfig.defectsTotalDataSetSize).then((lastDefects) => {
			helper.logSuccess('Defects retrieved - OK');
			helper.logMessage('Checking for anomalies...');
			let tags = [];
			let promises = [];
			checkersConfig.checkers.forEach(c => {
				if ((_.isUndefined(c.enabled) || c.enabled) && c.entity === 'defect') {
					let checker = require(`../checks/${c.name}`);
					promises.push(checker.check(lastDefects, c.options));
					tags.push(c.tag);
				}
			});
			let count = 0;
			Promise.all(promises).then((results) => {
				results.forEach(result => {
					_.forEach(result, (value, id) => {
						let defect = ensureDefect(id, value.d);
						if (!tagsManager.hasGeneralAnomalyTag(defect.newTags)) {
							defect.newTags.push(tagsManager.getGeneralAnomalyTagName());
						}
						defect.newTags.push(tags[count]);
						defect.newTags.sort();
						defect.anomalies.push(value.text);
						helper.logAnomaly(value.text);
					});
					count++;
				});
				helper.logSuccess(`Checking for anomalies - OK`);
				resolve();
			},
			(err) => {
				helper.logError('Error on checkForAnomalies() ' + (err.message || err));
				reject(err);
			});
		},
		(err) => {
			helper.logError('Error on checkForAnomalies() ' + (err.message || err));
			reject(err);
		});
	});
}

function loadFromOctane() {
	return new Promise((resolve, reject) => {
		octaneDataProvider.getTaggedDefects(tagsManager.getGeneralAnomalyTagId()).then(
		taggedDefects => {
			if (taggedDefects && taggedDefects['total_count'] > 0) {
				helper.logMessage(`${taggedDefects.data.length} defects with anomalies were loaded from Octane`);
				taggedDefects.data.forEach(d => {
					let defect = ensureDefect(d.id, d);
					defect.curTags = tagsManager.getAllAnomalyTagNames(d['user_tags']);
				});
			} else {
				helper.logMessage(`No defects with anomalies were loaded from Octane`);
			}
			helper.logSuccess(`Defects loaded from Octane - OK`);
			resolve();
		},
		(err) => {
			helper.logError('Error on loadFromOctane() ' + (err.message || err));
			reject(err);
		});
	});
}

function updateOctane() {
	return new Promise((resolve, reject) => {
		let promises = [];
		_.forEach(defects, (value, id) => {
			if (tagsManager.hasIgnoreAnomalyTag(value.curTags)) {
				value.newTags = [];
			}
			let needToUpdate = value.curTags.join() !== value.newTags.join();
			if (needToUpdate) {
				let body = {
					id: id,
					user_tags: {
						data: []
					}
				};
				if (value.d.user_tags['total_count'] && value.d.user_tags['total_count'] > 0) {
					value.d.user_tags.data.forEach(t => {
						if (!tagsManager.isAnomalyTagId(t.id)) {
							body.user_tags.data.push({
								type: 'user_tag',
								id: t.id
							});
						}
					});
				}
				value.newTags.forEach(tn => {
					body.user_tags.data.push({
						type: 'user_tag',
						id: tagsManager.getTagIdByName(tn)
					});
				});
				promises.push(octaneDataProvider.updateDefectUserTags(id, body));
			} else {
				helper.logMessage(`No need to update defect #${id}`);
			}
		});
		Promise.all(promises).then(() => {
			helper.logSuccess('Octane updated - OK');
			resolve();
		},
		(err) => {
			helper.logError('Error on updateOctane() ' + (err.message || err));
			reject(err);
		});
	});
}

function saveToStorage() {
	return new Promise((resolve, reject) => {
		nodePersist.init({dir: './storage/'}).then(() => {
			let storageData = [];
			_.forEach(defects, (value, id) => {
				if (value.anomalies.length > 0) {
					storageData.push({
						id: id,
						anomalies: value.anomalies
					})
				}
			});
			nodePersist.setItem('defects', storageData).then(() => {
				helper.logSuccess('Storage updated');
				resolve();
			},
			(err) => {
				helper.logError('Error on saveToStorage() ' + (err.message || err));
				reject(err);
			});
		},
		(err) => {
			helper.logError('Error on saveToStorage() ' + (err.message || err));
			reject(err);
		});
	});
}

function handleDefects() {
	let promises1 = [
		checkForAnomalies(),
		loadFromOctane()
	];
	Promise.all(promises1).then(() => {
		let promises2 = [
			saveToStorage(),
			updateOctane()
		];
		Promise.all(promises2).then(() => {
			helper.logSuccess('Done');
		},
		(err) => {
			helper.logError('Error on handleDefects() - ' + (err.message || err));
		});
	},
	(err) => {
		helper.logError('Error on handleDefects() - ' + (err.message || err));
	});
}

module.exports = {
	handleDefects: handleDefects,
};
