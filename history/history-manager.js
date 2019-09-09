'use strict';
const logger = require('../logger/logger');
const octaneDataProvider = require('../octane/octane-data-provider');

const getSingleActionHistoryLogs = async (action, fieldName, defectIds, fromTimestamp, toTimestamp, bachLimit) => {
	logger.logMessage('getSingleActionHistoryLogs()');
	logger.logMessage(`action: ${action}`);
	logger.logMessage(`fieldName: ${fieldName}`);
	let result = {};
	let previousResults = {};
	let audits;
	let cont = true;
	try {
		do {
			audits = await octaneDataProvider.getHistoryLogsBatch(action, fieldName, fromTimestamp, toTimestamp, bachLimit);
			if (audits) {
				let lastAudit = audits.data[audits.data.length - 1];
				if (audits.data.length === bachLimit && lastAudit.timestamp === toTimestamp) {
					cont = false;
				} else {
					toTimestamp = lastAudit.timestamp;
					let filteredAudits = audits.data.filter(audit => !previousResults[audit.entity_id + '_' + audit.timestamp]);
					filteredAudits = filteredAudits.filter(audit => defectIds.includes(audit.entity_id));
					previousResults = {};
					filteredAudits.forEach(audit => {
						previousResults[audit.entity_id + '_' + audit.timestamp] = true;
						if (!result[audit.entity_id]) {
							result[audit.entity_id] = [];
						}
						result[audit.entity_id].push({
							time: audit.timestamp,
							value: audit.change_set.find(change => change.field_name === fieldName).value_text
						});
						result[audit.entity_id] = result[audit.entity_id].sort((a,b) => {
							return a.time.localeCompare(b.time);
						});
					});
				}
			}
			else {
				cont = false;
			}
		} while (cont && audits.data.length === bachLimit);
	} catch (err) {
		logger.logFuncError('getSingleActionHistoryLogs', err);
	}
	return result;
};

const getHistoryLogs = async (fieldName, defectIds, fromTimestamp, toTimestamp) => {
	logger.logMessage('getHistoryLogs()');
	let result = {};
	const BATCH_LIMIT = 1000;
	const createResults = await getSingleActionHistoryLogs('create', fieldName, defectIds, fromTimestamp, toTimestamp, BATCH_LIMIT);
	const updateResults = await getSingleActionHistoryLogs('update', fieldName, defectIds, fromTimestamp, toTimestamp, BATCH_LIMIT);
	defectIds.forEach(id => {
		if (createResults[id]) {
			if (!result[id]) {
				result[id] = [];
			}
			createResults[id].forEach(change => {
				result[id].push(change.value || '<empty>');
			})
		}
		if (updateResults[id]) {
			if (!result[id]) {
				result[id] = [];
			}
			updateResults[id].forEach(change => {
				result[id].push(change.value || '<empty>');
			})
		}
	});
	return result;
};

module.exports = {
	getHistoryLogs,
};
