'use strict';
const _ = require('lodash');
const logger = require('../logger/logger');
const settings = require('../.settings');
const tagsManager = require('../tags/tags-manager');
const octaneDataProvider = require('../octane/octane-data-provider');
const defects = {};
const stories = {};
const qualityStories = {};
const DEFECT_SUBTYPE = 'defect';
const STORY_SUBTYPE = 'story';
const QUALITY_STORY_SUBTYPE = 'quality_story';

const getEntityKey = (subtype) => {
	let key = '';
	switch (subtype) {
		case 'defect':
			key = 'd';
			break;
		case 'story':
			key = 's';
			break;
		case 'quality_story':
			key = 'qs';
			break;
	}
	return key;
};

const ensureEntity = (id, entity, entities, subtype) => {
	const key = getEntityKey(subtype);
	if (!entities[id]) {
		entities[id] = {
			[key]: entity,
			curTags: [],
			newTags: [],
			anomalies: []
		};
	} else {
		if (!entities[id][key] && entity) {
			entities[id][key] = entity;
		}
	}
	return entities[id];
};

const loadFromOctane = async (entities, subtype) => {
	try {
		logger.logMessage(`loadFromOctane() subtype: ${subtype}`);
		const generalAnomalyTagId = tagsManager.getGeneralAnomalyTagId();
		const ignoreAnomalyTagId = tagsManager.getIgnoreAnomalyTagId();
		logger.logMessage(`loadFromOctane() - Loading entities with "Anomaly" or "Ignore Anomaly" tags from Octane...`);
		const taggedEntities = await octaneDataProvider.getTaggedEntities(generalAnomalyTagId, ignoreAnomalyTagId, subtype);
		if (taggedEntities && taggedEntities['total_count'] > 0) {
			logger.logMessage(`loadFromOctane() - ${taggedEntities.data.length} entities with "Anomaly" or "Ignore Anomaly" tags were loaded from Octane`);
			taggedEntities.data.forEach(e => {
				const entity = ensureEntity(e.id, e, entities, subtype);
				entity.curTags = tagsManager.getAllAnomalyTagNames(e.user_tags);
			});
		} else {
			logger.logMessage(`loadFromOctane() - No entities with "Anomaly" or "Ignore Anomaly" tags were found in Octane`);
		}
		logger.logSuccess(`loadFromOctane() - Entities loaded from Octane - OK`);
	} catch(err) {
		logger.logFuncError('loadFromOctane', err);
		throw err;
	}
};

const checkForAnomalies = async (entities, subtype) => {
	try {
		let retrievalLimit = 0;
		switch (subtype) {
			case 'defect':
				retrievalLimit = settings.defectsRetrievalLimit;
				break;
			case 'story':
				retrievalLimit = settings.storiesRetrievalLimit;
				break;
			case 'quality_story':
				retrievalLimit = settings.qualityStoriesRetrievalLimit;
				break;
		}
		logger.logMessage(`checkForAnomalies() subtype: ${subtype}`);
		const totalNumberOfEntities = await octaneDataProvider.getTotalNumberOfEntities(subtype);
		const numberOfEntitiesToRetrieve = Math.min(totalNumberOfEntities, retrievalLimit);
		logger.logMessage(`checkForAnomalies() - Retrieving ${numberOfEntitiesToRetrieve} entities from Octane...`);
		const lastEntities = await octaneDataProvider.getLastEntities(numberOfEntitiesToRetrieve, subtype);
		logger.logSuccess(`checkForAnomalies() - ${numberOfEntitiesToRetrieve} entities retrieved - OK`);
		logger.logMessage('checkForAnomalies() - Checking for anomalies. Please wait...');
		const promises = [];
		const tagMap = {};
		settings.checkers.forEach(c => {
			if ((_.isUndefined(c.enabled) || c.enabled) && c.entity === subtype) {
				const checker = require(`../checks/${c.name}`);
				tagMap[c.name] = c.tag;
				promises.push(checker.check(lastEntities, c.options));
			}
		});
		let checkersCount = 0;
		let totalAnomalies = 0;
		const results = await Promise.all(promises);
		results.forEach(result => {
			const checkerName = result.checkerName;
			if (result) {
				_.forEach(result.anomalies, (value, id) => {
					const entity = ensureEntity(id, value.e, entities, subtype);
					if (!tagsManager.hasGeneralAnomalyTag(entity.newTags)) {
						entity.newTags.push(tagsManager.getGeneralAnomalyTagName());
					}
					entity.newTags.push(tagMap[checkerName]);
					entity.newTags.sort();
					entity.anomalies.push(value.text);
					logger.logAnomaly(value.text);
					totalAnomalies++;
				});
			}
			checkersCount++;
		});
		let countEntitiesWithAnomalies = 0;
		_.forEach(entities, (value) => {
			if (value.anomalies.length > 0) {
				countEntitiesWithAnomalies++;
			}
		});
		logger.logMessage(`checkForAnomalies() - ${countEntitiesWithAnomalies} entities with anomalies were found`);
		logger.logMessage(`checkForAnomalies() - ${totalAnomalies} total anomalies were found`);
		logger.logSuccess(`checkForAnomalies() - Checking for anomalies - OK`);
	} catch (err) {
		logger.logFuncError('checkForAnomalies', err);
		throw err;
	}
};

const constructOneEntityRecord = (value, id, subtype) => {
	let result = null;
	if (tagsManager.hasIgnoreAnomalyTag(value.curTags)) {
		value.newTags = [tagsManager.getIgnoreAnomalyTagName()];
		logger.logMessage(`constructOneDefectRecord() - Ignore anomalies for entity #${id}`);
	}

	//enable next line to remove all anomaly tags from Octane
	//value.newTags = [];

	const needToUpdate = value.curTags.join() !== value.newTags.join();
	if (needToUpdate) {
		logger.logMessage(`constructOneDefectRecord() - Entity #${id} needs update: [${value.curTags.join(', ')}] -> [${value.newTags.join(', ')}]`);
		result = {
			id: id,
			user_tags: {
				data: []
			}
		};
		const key = getEntityKey(subtype);
		if (value[key].user_tags['total_count'] && value[key].user_tags['total_count'] > 0) {
			value[key].user_tags.data.forEach(t => {
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
		logger.logMessage(`constructOneDefectRecord() - Entity #${id} skipped`);
	}
	return result;
};

const logUpdateResult = (countEntitiesNeedUpdate, countEntitiesUpdated) => {
	if (countEntitiesUpdated === 0) {
		logger.logWarning(`updateAlmOctane() - Octane was not updated`);
	} else if (countEntitiesUpdated !== countEntitiesNeedUpdate) {
		logger.logSuccess(`updateAlmOctane() - ${countEntitiesUpdated} entities successfully updated - OK`);
		logger.logWarning(`updateAlmOctane() - Octane partially updated - ${countEntitiesUpdated}/${countEntitiesNeedUpdate}`);
	} else {
		logger.logSuccess(`updateAlmOctane() - ${countEntitiesUpdated} entities successfully updated - OK`);
	}
};

const updateAlmOctaneByBatches = async (entities, subtype) => {
	try {
		let maxEntitiesPerUpdateBatch = settings.updateAlmOctaneMaxBatch || 200;
		logger.logMessage(`updateAlmOctaneByBatches() - Max batch size: ${maxEntitiesPerUpdateBatch}`);
		let entitiesBatches = [];
		let countEntitiesNeedUpdate = 0;
		let countEntitiesSkipped = 0;
		const promises = [];
		_.forEach(entities, (value, id) => {
			let oneEntityRecord = constructOneEntityRecord(value, id, subtype);
			if (oneEntityRecord) {
				const curBatchIndex = Math.trunc(countEntitiesNeedUpdate / maxEntitiesPerUpdateBatch);
				if (!entitiesBatches[curBatchIndex]) {
					entitiesBatches[curBatchIndex] = [];
				}
				entitiesBatches[curBatchIndex].push(oneEntityRecord);
				countEntitiesNeedUpdate++;
			} else {
				countEntitiesSkipped++;
			}
		});
		entitiesBatches.forEach(batch => {
			promises.push(octaneDataProvider.updateMultipleEntitiesUserTags({data: batch}));
		});
		logger.logMessage(`updateAlmOctane() - Trying to update ${countEntitiesNeedUpdate} entities...`);
		const results = await Promise.all(promises);
		let countEntitiesUpdated = results.reduce((acc, cur) => {
			return acc + cur;
		}, 0);
		logUpdateResult(countEntitiesNeedUpdate, countEntitiesUpdated);
	} catch(err) {
		logger.logFuncError('updateAlmOctane', err);
		throw err;
	}
};

const handleEntities  = async (entities, subtype) => {
	try {
		logger.logMessage(`handleEntities() subtype: ${subtype}`);
		await loadFromOctane(entities, subtype);
		await checkForAnomalies(entities, subtype);
		if (settings.updateAlmOctane) {
			await updateAlmOctaneByBatches(entities, subtype);
		} else {
			logger.logWarning('Skip update ALM Octane');
		}
	} catch(err) {
		logger.logFuncError('handleEntities', err);
		throw err;
	}
};

const handleAllEntities  = async () => {
	try {
		logger.logMessage('handleAllEntities()');
		logger.logDivider();
		await handleEntities(defects, DEFECT_SUBTYPE);
		logger.logDivider();
		await handleEntities(stories, STORY_SUBTYPE);
		logger.logDivider();
		await handleEntities(qualityStories, QUALITY_STORY_SUBTYPE);
		logger.logDivider();
	} catch(err) {
		logger.logFuncError('handleAllEntities', err);
		throw err;
	}
};

module.exports = {
	loadFromOctane,
	checkForAnomalies,
	handleAllEntities
};
