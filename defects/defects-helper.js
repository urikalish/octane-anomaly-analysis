'use strict';
const settings = require('../.settings');
const commonHelper = require('../common/common-helper');

const getDefectDetailsStr = (d) => {
	if (!d.severity) {
		console.log('############' + d.id);
	}
	return `${d.severity ? d.severity.name : '<No Severity>'} | ${d.phase ? d.phase.name : '<No Phase>'} | ${d.team ? d.team.name : '<No Team>'} | ${commonHelper.getEntityOwnersStr(d)} | #${d.id || '<No ID>'} | ${d.name || '<No Name>'}`;
};

const initCheckerResult = (checkerName) => {
	return commonHelper.initCheckerResult(checkerName);
};

const addDefectAnomaly = (checkerResult, d, text) => {
	checkerResult.anomalies[d.id] = {
		e: d,
		checkerName: checkerResult.checkerName,
		text: `${text} | ${getDefectDetailsStr(d)}`
	};
};

const getEarliestTimestamp = (defects) => {
	let earliestRelevantDefectTimestamp = '';
	defects.forEach(d => {
		if (earliestRelevantDefectTimestamp === '' || earliestRelevantDefectTimestamp.localeCompare(d['creation_time']) > 0) {
			earliestRelevantDefectTimestamp = d['creation_time'];
		}
	});
	return earliestRelevantDefectTimestamp;
};

const getHistoryLogsTimeRange = (defects) => {
	return {
		from:
			settings.historyLogs && settings.historyLogs.manualTimeRange && settings.historyLogs.manualTimeRangeFrom ?
			settings.historyLogs.manualTimeRangeFrom :
			getEarliestTimestamp(defects) || '1970-01-01T00:00:00Z',
		to:
			settings.historyLogs && settings.historyLogs.manualTimeRange && settings.historyLogs.manualTimeRangeTo ?
			settings.historyLogs.manualTimeRangeTo :
			'2030-01-01T00:00:00Z'
	};
};

module.exports = {
	initCheckerResult,
	addDefectAnomaly,
	getHistoryLogsTimeRange,
};
