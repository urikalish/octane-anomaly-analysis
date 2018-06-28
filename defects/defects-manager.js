'use strict';
const _ = require('lodash');
const nodePersist = require('node-persist');
const settings = require('../config/settings');
const logger = require('../logger/logger');
const tagsManager = require('../tags/tags-manager');
const octaneDataProvider = require('../octane/octane-data-provider');

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
		logger.logMessage(`checkForAnomalies() - Retrieving last ${settings.defectsTotalDataSetSize} defects from Octane...`);
		octaneDataProvider.getLastDefects(settings.defectsTotalDataSetSize).then((lastDefects) => {
			logger.logSuccess('checkForAnomalies() - Defects retrieved - OK');
			logger.logMessage('checkForAnomalies() - Checking for anomalies...');
			let promises = [];
			let tagMap = {};
			settings.checkers.forEach(c => {
				if ((_.isUndefined(c.enabled) || c.enabled) && c.entity === 'defect') {
					let checker = require(`../checks/${c.name}`);
					tagMap[c.name] = c.tag;
					promises.push(checker.check(lastDefects, c.options));
				}
			});
			let checkersCount = 0;
			let totalAnomalies = 0;
			Promise.all(promises).then((results) => {
				results.forEach(result => {
					let checkerName = result.checkerName;
					_.forEach(result.anomalies, (value, id) => {
						let defect = ensureDefect(id, value.d);
						if (!tagsManager.hasGeneralAnomalyTag(defect.newTags)) {
							defect.newTags.push(tagsManager.getGeneralAnomalyTagName());
						}
						defect.newTags.push(tagMap[checkerName]);
						defect.newTags.sort();
						defect.anomalies.push(value.text);
						logger.logAnomaly(value.text);
						totalAnomalies++;
					});
					checkersCount++;
				});
				let countDefectsWithAnomalies = 0;
				_.forEach(defects, (value) => {
					if (value.anomalies.length > 0) {
						countDefectsWithAnomalies++;
					}
				});
				logger.logMessage(`checkForAnomalies() - ${countDefectsWithAnomalies} defects with anomalies were found`);
				logger.logMessage(`checkForAnomalies() - ${totalAnomalies} total anomalies were found`);
				logger.logSuccess(`checkForAnomalies() - Checking for anomalies - OK`);
				resolve();
			},
			(err) => {
				logger.logError('Error on checkForAnomalies() ' + (err.message || err));
				reject(err);
			});
		},
		(err) => {
			logger.logError('Error on checkForAnomalies() ' + (err.message || err));
			reject(err);
		});
	});
}

function loadFromOctane() {
	return new Promise((resolve, reject) => {
		let generalAnomalyTagId = tagsManager.getGeneralAnomalyTagId();
		let ignoreAnomalyTagId = tagsManager.getIgnoreAnomalyTagId();
		logger.logMessage(`loadFromOctane() - Loading defects with "Anomaly" or "Ignore Anomaly" tags from Octane...`);
		octaneDataProvider.getTaggedDefects(generalAnomalyTagId, ignoreAnomalyTagId).then(
		(taggedDefects) => {
			if (taggedDefects && taggedDefects['total_count'] > 0) {
				logger.logMessage(`loadFromOctane() - ${taggedDefects.data.length} defects with "Anomaly" or "Ignore Anomaly" tags were loaded from Octane`);
				taggedDefects.data.forEach(d => {
					let defect = ensureDefect(d.id, d);
					defect.curTags = tagsManager.getAllAnomalyTagNames(d['user_tags']);
				});
			} else {
				logger.logMessage(`loadFromOctane() - No defects with "Anomaly" or "Ignore Anomaly" tags were found in Octane`);
			}
			logger.logSuccess(`loadFromOctane() - Defects loaded from Octane - OK`);
			resolve();
		},
		(err) => {
			logger.logError('Error on loadFromOctane() ' + (err.message || err));
			reject(err);
		});
	});
}

function updateOctane() {
	return new Promise((resolve, reject) => {
		let promises = [];
		_.forEach(defects, (value, id) => {
			if (tagsManager.hasIgnoreAnomalyTag(value.curTags)) {
				value.newTags = [tagsManager.getIgnoreAnomalyTagName()];
				logger.logMessage(`updateOctane() - Ignore anomalies for defect #${id}`);
			}

			//enable next line to remove all anomaly tags from Octane
			//value.newTags = [];

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
				logger.logMessage(`updateOctane() - Try update defect #${id}`);
			} else {
				logger.logMessage(`updateOctane() - Skip update defect #${id}`);
			}
		});
		logger.logMessage(`updateOctane() - Trying to update ${promises.length} defects...`);
		Promise.all(promises).then((results) => {
			let successCount = 0;
			results.forEach(r => {
				if (r !== null) {
					successCount++;
				}
			});
			if (successCount === results.length) {
				logger.logSuccess('updateOctane() - Octane updated - OK');
			} else {
				logger.logError(`updateOctane() - Octane partially updated - ${successCount}/${results.length}`);
			}
			resolve();
		},
		(err) => {
			logger.logError('Error on updateOctane() ' + (err.message || err));
			reject(err);
		});
	});
}

function saveToStorage() {
	return new Promise((resolve, reject) => {
		logger.logMessage('saveToStorage() - Initializing storage...');
		nodePersist.init({dir: './storage/'}).then(() => {
			logger.logSuccess('saveToStorage() - Storage initialized - OK');
			let storageData = [];
			_.forEach(defects, (value, id) => {
				if (value.anomalies.length > 0) {
					storageData.push({
						id: id,
						anomalies: value.anomalies
					})
				}
			});
			logger.logMessage('saveToStorage() - Saving to storage...');
			nodePersist.setItem('defects', storageData).then(() => {
				logger.logSuccess('saveToStorage() - Storage updated - OK');
				resolve();
			},
			(err) => {
				logger.logError('Error on saveToStorage() ' + (err.message || err));
				reject(err);
			});
		},
		(err) => {
			logger.logError('Error on saveToStorage() ' + (err.message || err));
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
		let promises2 = [];
		if (settings.saveToStorage) {
			promises2.push(saveToStorage());
		} else {
			logger.logWarning('Skip save to storage');
		}
		if (settings.updateOctane) {
			promises2.push(updateOctane());
		} else {
			logger.logWarning('Skip update Octane');
		}
		Promise.all(promises2).then(() => {
			logger.logMessage('Done');
		},
		(err) => {
			logger.logError('Error on handleDefects() - ' + (err.message || err));
		});
	},
	(err) => {
		logger.logError('Error on handleDefects() - ' + (err.message || err));
	});
}

module.exports = {
	handleDefects: handleDefects,
};
