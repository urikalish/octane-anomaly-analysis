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
			tags: {
				octane: [],
				storage: [],
				current: []
			},
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
	return new Promise((resolve /*, reject*/) => {
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
					_.forEach(result, (value, key) => {
						let defect = ensureDefect(key, value.d);
						if (!tagsManager.hasGeneralAnomalyTag(defect.tags.current)) {
							defect.tags.current.push(tagsManager.getGeneralAnomalyTagName());
						}
						defect.tags.current.push(tags[count]);
						defect.anomalies.push(value.text);
						helper.logAnomaly(value.text);
					});
					count++;
				});
				helper.logSuccess(`Checking for anomalies - OK`);
				resolve();
			});
		});
	});
}

function loadFromOctane() {
	return new Promise((resolve /*, reject*/) => {
		let generalAnomalyTagId = tagsManager.getGeneralAnomalyTagId();
		octaneDataProvider.getTaggedDefects(generalAnomalyTagId).then(
		taggedDefects => {
			if (taggedDefects && taggedDefects['total_count'] > 0) {
				helper.logMessage(`${taggedDefects.data.length} defects with anomalies were loaded from Octane`);
				taggedDefects.data.forEach(d => {
					let defect = ensureDefect(d.id, d);
					defect.tags.octane = tagsManager.getAllAnomalyTags(d['user_tags']);
				});
			} else {
				helper.logMessage(`No defects with anomalies were loaded from Octane`);
			}
			helper.logSuccess(`Defects loaded from Octane - OK`);
			resolve();
		});
	});
}

function loadFromStorage() {
	return new Promise((resolve /*, reject*/) => {
		nodePersist.init({dir: './storage/'}).then(() => {
			let count = 0;
			nodePersist.getItem('defects').then((storageDefects) => {
				if (storageDefects) {
					storageDefects.forEach(storageDefect => {
						let defect = ensureDefect(storageDefect.id);
						defect.tags.storage = storageDefect.tags;
						count++;
					});
				}
				helper.logMessage(`${count} defects with anomalies were loaded from Persistency`);
				helper.logSuccess(`Defects loaded from Persistency - OK`);
				resolve();
			});
		});
	});
}

function saveToStorage() {
	return new Promise((resolve /*, reject*/) => {
		nodePersist.init({dir: './storage/'}).then(() => {
			let storageData = [];
			_.forEach(defects, (value, key) => {
				if (value.tags.current.length > 0) {
					storageData.push({
						id: key,
						tags: value.tags.current,
						anomalies: value.anomalies
					})
				}
			});
			nodePersist.setItem('defects', storageData).then(() => {
				resolve();
			})
		});
	});
}

function handleDefects() {
	let promises = [
		checkForAnomalies(),
		loadFromOctane(),
		loadFromStorage()
	];
	Promise.all(promises).then((/*results*/) => {
		saveToStorage().then(() => {
			helper.logSuccess('Done');
		});
	});
}

module.exports = {
	handleDefects: handleDefects,
};
