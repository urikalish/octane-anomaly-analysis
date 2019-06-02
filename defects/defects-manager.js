'use strict';
const _ = require('lodash');
const nodePersist = require('node-persist');
const settings = require('../.settings');
const logger = require('../logger/logger');
const tagsManager = require('../tags/tags-manager');
const octaneDataProvider = require('../octane/octane-data-provider');
const defects = {};

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
		const totalNumberOfDefects = await octaneDataProvider.getTotalNumberOfDefects();
		const numberOfDefectsToRetrieve = Math.min(totalNumberOfDefects, settings.defectsRetrievalLimit);
		logger.logMessage(`checkForAnomalies() - Retrieving ${numberOfDefectsToRetrieve} defects from Octane...`);
		const lastDefects = await octaneDataProvider.getLastDefects(numberOfDefectsToRetrieve);
		logger.logSuccess(`checkForAnomalies() - ${numberOfDefectsToRetrieve} defects retrieved - OK`);
		logger.logMessage('checkForAnomalies() - Checking for anomalies. Please wait...');
		const promises = [];
		const tagMap = {};
		settings.checkers.forEach(c => {
			if ((_.isUndefined(c.enabled) || c.enabled) && c.entity === 'defect') {
				const checker = require(`../checks/${c.name}`);
				tagMap[c.name] = c.tag;
				promises.push(checker.check(lastDefects, c.options));
			}
		});
		let checkersCount = 0;
		let totalAnomalies = 0;
		const results = await Promise.all(promises);
		results.forEach(result => {
			const checkerName = result.checkerName;
			if (result) {
				_.forEach(result.anomalies, (value, id) => {
					const defect = ensureDefect(id, value.d);
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
		const generalAnomalyTagId = tagsManager.getGeneralAnomalyTagId();
		const ignoreAnomalyTagId = tagsManager.getIgnoreAnomalyTagId();
		logger.logMessage(`loadFromOctane() - Loading defects with "Anomaly" or "Ignore Anomaly" tags from Octane...`);
		const taggedDefects = await octaneDataProvider.getTaggedDefects(generalAnomalyTagId, ignoreAnomalyTagId);
		if (taggedDefects && taggedDefects['total_count'] > 0) {
			logger.logMessage(`loadFromOctane() - ${taggedDefects.data.length} defects with "Anomaly" or "Ignore Anomaly" tags were loaded from Octane`);
			taggedDefects.data.forEach(d => {
				const defect = ensureDefect(d.id, d);
				defect.curTags = tagsManager.getAllAnomalyTagNames(d.user_tags);
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

const updateAlmOctane = async () => {
	try {
		let skipCount = 0;
		const promises = [];
		_.forEach(defects, (value, id) => {
			if (tagsManager.hasIgnoreAnomalyTag(value.curTags)) {
				value.newTags = [tagsManager.getIgnoreAnomalyTagName()];
				logger.logMessage(`updateAlmOctane() - Ignore anomalies for defect #${id}`);
			}

			//enable next line to remove all anomaly tags from Octane
			//value.newTags = [];

			const needToUpdate = value.curTags.join() !== value.newTags.join();
			if (needToUpdate) {
				const body = {
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
				skipCount++;
			}
		});
		logger.logMessage(`updateAlmOctane() - Trying to update ${promises.length} defects...`);
		const results = await Promise.all(promises);
		let successCount = 0;
		results.forEach(r => {
			if (r !== null) {
				successCount++;
			}
		});
		if (skipCount > 0) {
			logger.logSuccess(`updateAlmOctane() - ${skipCount} defects already updated - OK`);
		}
		if (successCount === 0) {
			logger.logWarning(`updateAlmOctane() - Octane was not updated`);
		} else if (successCount !== results.length) {
			logger.logSuccess(`updateAlmOctane() - ${successCount} defects successfully updated - OK`);
			logger.logWarning(`updateAlmOctane() - Octane partially updated - ${successCount}/${results.length}`);
		} else {
			logger.logSuccess(`updateAlmOctane() - ${successCount} defects successfully updated - OK`);
		}
	} catch(err) {
		logger.logFuncError('updateAlmOctane', err);
		throw err;
	}
};

const saveToLocalStorage = async () => {
	try {
		logger.logMessage('saveToLocalStorage() - Initializing storage...');
		await nodePersist.init({dir: './storage/'});
		logger.logSuccess('saveToLocalStorage() - Storage initialized - OK');
		const storageData = [];
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
		const promises2 = [];
		if (settings.saveToLocalStorage) {
			promises2.push(saveToLocalStorage());
		} else {
			logger.logMessage('Skip save to storage');
		}
		if (settings.updateAlmOctane) {
			promises2.push(updateAlmOctane());
		} else {
			logger.logWarning('Skip update ALM Octane');
		}
		await Promise.all(promises2);
	} catch(err) {
		logger.logFuncError('handleDefects', err);
		throw err;
	}
};

module.exports = {
	handleDefects,
};
