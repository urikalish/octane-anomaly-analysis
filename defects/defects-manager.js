'use strict';
const _ = require('lodash');
const nodePersist = require('node-persist');
const settings = require('../.settings');
const logger = require('../logger/logger');
const tagsManager = require('../tags/tags-manager');
const octaneDataProvider = require('../octane/octane-data-provider');
let defects = {};

const ensureDefect = (id, d) => {
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
};

const checkForAnomalies = async () => {
	try {
		let totalNumberOfDefects = await octaneDataProvider.getTotalNumberOfDefects();
		let numberOfDefectsToRetrieve = Math.min(totalNumberOfDefects, settings.defectsRetrievalLimit);
		logger.logMessage(`checkForAnomalies() - Retrieving ${numberOfDefectsToRetrieve} defects from Octane...`);
		let lastDefects = await octaneDataProvider.getLastDefects(numberOfDefectsToRetrieve);
		logger.logSuccess(`checkForAnomalies() - ${numberOfDefectsToRetrieve} defects retrieved - OK`);
		logger.logMessage('checkForAnomalies() - Checking for anomalies. Please wait...');
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
		let results = await Promise.all(promises);
		results.forEach(result => {
			let checkerName = result.checkerName;
			if (result) {
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
			}
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
	} catch (err) {
		logger.logFuncError('checkForAnomalies', err);
		throw err;
	}
};

const loadFromOctane = async () => {
	try {
		let generalAnomalyTagId = tagsManager.getGeneralAnomalyTagId();
		let ignoreAnomalyTagId = tagsManager.getIgnoreAnomalyTagId();
		logger.logMessage(`loadFromOctane() - Loading defects with "Anomaly" or "Ignore Anomaly" tags from Octane...`);
		let taggedDefects = await octaneDataProvider.getTaggedDefects(generalAnomalyTagId, ignoreAnomalyTagId);
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
	} catch(err) {
		logger.logFuncError('loadFromOctane', err);
		throw err;
	}
};

const updateOctane = async () => {
	try {
		let skipCount = 0;
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
				//logger.logMessage(`updateOctane() - Try update defect #${id}`);
			} else {
				skipCount++;
				//logger.logMessage(`updateOctane() - Skip update defect #${id}`);
			}
		});
		logger.logMessage(`updateOctane() - Trying to update ${promises.length} defects...`);
		let results = await Promise.all(promises);
		let successCount = 0;
		results.forEach(r => {
			if (r !== null) {
				successCount++;
			}
		});
		if (skipCount > 0) {
			logger.logSuccess(`updateOctane() - ${skipCount} defects already updated - OK`);
		}
		if (successCount === 0) {
			logger.logWarning(`updateOctane() - Octane was not updated`);
		} else if (successCount !== results.length) {
			logger.logSuccess(`updateOctane() - ${successCount} defects successfully updated - OK`);
			logger.logWarning(`updateOctane() - Octane partially updated - ${successCount}/${results.length}`);
		} else {
			logger.logSuccess(`updateOctane() - ${successCount} defects successfully updated - OK`);
		}
	} catch(err) {
		logger.logFuncError('updateOctane', err);
		throw err;
	}
};

const saveToLocalStorage = async () => {
	try {
		logger.logMessage('saveToLocalStorage() - Initializing storage...');
		await nodePersist.init({dir: './storage/'});
		logger.logSuccess('saveToLocalStorage() - Storage initialized - OK');
		let storageData = [];
		_.forEach(defects, (value, id) => {
			if (value.anomalies.length > 0) {
				storageData.push({
					id: id,
					anomalies: value.anomalies
				})
			}
		});
		logger.logMessage('saveToLocalStorage() - Saving to storage...');
		await nodePersist.setItem('defects', storageData);
		logger.logSuccess('saveToLocalStorage() - Storage updated - OK');
	} catch(err) {
		logger.logFuncError('saveToLocalStorage', err);
		throw err;
	}
};

const handleDefects  = async () => {
	try {
		await loadFromOctane();
		await checkForAnomalies();
		let promises2 = [];
		if (settings.saveToLocalStorage) {
			promises2.push(saveToLocalStorage());
		} else {
			logger.logMessage('Skip save to storage');
		}
		if (settings.updateOctane) {
			promises2.push(updateOctane());
		} else {
			logger.logWarning('Skip update Octane');
		}
		await Promise.all(promises2);
	} catch(err) {
		logger.logFuncError('handleDefects', err);
		throw err;
	}
};

module.exports = {
	handleDefects: handleDefects,
};
