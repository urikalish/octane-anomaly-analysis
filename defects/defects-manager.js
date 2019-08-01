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

// const completeDefectsData = async (defects) => {
// 	logger.logMessage(`completeDefectsData() - Retrieving data from Octane...`);
// 	const phases = await octaneDataProvider.getAllPhases();
// 	const severities = await octaneDataProvider.getAllSeverities();
// 	defects.forEach(d => {
// 		const phase = _.find(phases, p => {return p.id === d.phase.id;});
// 		d.phase.logical_name = (phase && phase.logical_name) || '';
// 		const severity = _.find(severities, s => {return s.id === d.severity.id;});
// 		d.severity.logical_name = (severity && severity.logical_name) || '';
// 	});
// 	logger.logMessage(`completeDefectsData() - Retrieving data from Octane - OK`);
// };

const checkForAnomalies = async () => {
	try {
		const totalNumberOfDefects = await octaneDataProvider.getTotalNumberOfDefects();
		const numberOfDefectsToRetrieve = Math.min(totalNumberOfDefects, settings.defectsRetrievalLimit);
		logger.logMessage(`checkForAnomalies() - Retrieving ${numberOfDefectsToRetrieve} defects from Octane...`);
		const lastDefects = await octaneDataProvider.getLastDefects(numberOfDefectsToRetrieve);
		logger.logSuccess(`checkForAnomalies() - ${numberOfDefectsToRetrieve} defects retrieved - OK`);
		//await completeDefectsData(lastDefects);
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

const constructOneDefectRecord = (value, id) => {
	let result = null;
	if (tagsManager.hasIgnoreAnomalyTag(value.curTags)) {
		value.newTags = [tagsManager.getIgnoreAnomalyTagName()];
		logger.logMessage(`constructOneDefectRecord() - Ignore anomalies for defect #${id}`);
	}

	//enable next line to remove all anomaly tags from Octane
	//value.newTags = [];

	const needToUpdate = value.curTags.join() !== value.newTags.join();
	if (needToUpdate) {
		logger.logMessage(`constructOneDefectRecord() - Defect #${id} needs update: [${value.curTags.join(', ')}] -> [${value.newTags.join(', ')}]`);
		result = {
			id: id,
			user_tags: {
				data: []
			}
		};
		if (value.d.user_tags['total_count'] && value.d.user_tags['total_count'] > 0) {
			value.d.user_tags.data.forEach(t => {
				if (!tagsManager.isAnomalyTagId(t.id)) {
					result.user_tags.data.push({
						type: 'user_tag',
						id: t.id
					});
				}
			});
		}
		value.newTags.forEach(tn => {
			result.user_tags.data.push({
				type: 'user_tag',
				id: tagsManager.getTagIdByName(tn)
			});
		});
	} else {
		logger.logMessage(`constructOneDefectRecord() - Defect #${id} skipped`);
	}
	return result;
};

// const updateAlmOctaneOneByOne = async () => {
// 	try {
// 		let countDefectsNeedUpdate = 0;
// 		let countDefectsSkipped = 0;
// 		const promises = [];
// 		_.forEach(defects, (value, id) => {
// 			let oneDefectRecord = constructOneDefectRecord(value);
// 			if (oneDefectRecord) {
// 				promises.push(octaneDataProvider.updateDefectUserTags(id, oneDefectRecord));
// 				countDefectsNeedUpdate++;
// 			} else {
// 				countDefectsSkipped++;
// 			}
// 		});
// 		logger.logMessage(`updateAlmOctane() - Trying to update ${promises.length} defects...`);
// 		const results = await Promise.all(promises);
// 		let successCount = 0;
// 		results.forEach(r => {
// 			if (r !== null) {
// 				successCount++;
// 			}
// 		});
// 		logUpdateResult(countDefectsNeedUpdate, successCount);
// 	} catch(err) {
// 		logger.logFuncError('updateAlmOctane', err);
// 		throw err;
// 	}
// };

const updateAlmOctaneByBatches = async () => {
	try {
		let maxDefectsPerUpdateBatch = settings.updateAlmOctaneMaxBatch || 200;
		logger.logMessage(`updateAlmOctaneByBatches() - Max batch size: ${maxDefectsPerUpdateBatch}`);
		let defectBatches = [];
		let countDefectsNeedUpdate = 0;
		let countDefectsSkipped = 0;
		const promises = [];
		_.forEach(defects, (value, id) => {
			let oneDefectRecord = constructOneDefectRecord(value, id);
			if (oneDefectRecord) {
				const curBatchIndex = Math.trunc(countDefectsNeedUpdate / maxDefectsPerUpdateBatch);
				if (!defectBatches[curBatchIndex]) {
					defectBatches[curBatchIndex] = [];
				}
				defectBatches[curBatchIndex].push(oneDefectRecord);
				countDefectsNeedUpdate++;
			} else {
				countDefectsSkipped++;
			}
		});
		defectBatches.forEach(batch => {
			promises.push(octaneDataProvider.updateMultipleDefectsUserTags({data: batch}));
		});
		logger.logMessage(`updateAlmOctane() - Trying to update ${countDefectsNeedUpdate} defects...`);
		//const results = await Promise.all(promises);
		const results = await promises[0];
		let countDefectsUpdated = results.reduce((acc, cur) => {
			return acc + cur;
		}, 0);
		logUpdateResult(countDefectsNeedUpdate, countDefectsUpdated);
	} catch(err) {
		logger.logFuncError('updateAlmOctane', err);
		throw err;
	}
};

const logUpdateResult = (countDefectsNeedUpdate, countDefectsUpdated) => {
	if (countDefectsUpdated === 0) {
		logger.logWarning(`updateAlmOctane() - Octane was not updated`);
	} else if (countDefectsUpdated !== countDefectsNeedUpdate) {
		logger.logSuccess(`updateAlmOctane() - ${countDefectsUpdated} defects successfully updated - OK`);
		logger.logWarning(`updateAlmOctane() - Octane partially updated - ${countDefectsUpdated}/${countDefectsNeedUpdate}`);
	} else {
		logger.logSuccess(`updateAlmOctane() - ${countDefectsUpdated} defects successfully updated - OK`);
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
		if (settings.saveToLocalStorage) {
			await saveToLocalStorage();
		} else {
			logger.logMessage('Skip save to storage');
		}
		if (settings.updateAlmOctane) {
			// if (settings.updateAlmOctaneMaxBatch === 1) {
			// 	await updateAlmOctaneOneByOne();
			// } else {
			await updateAlmOctaneByBatches();
			// }
		} else {
			logger.logWarning('Skip update ALM Octane');
		}
	} catch(err) {
		logger.logFuncError('handleDefects', err);
		throw err;
	}
};

module.exports = {
	handleDefects,
};
