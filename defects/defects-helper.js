'use strict';
const settings = require('../.settings');

const getDefectOwnersStr = (d) => {
	const owner = d.owner && (d.owner.full_name || d.owner.name);
	const qaOwner = d.qa_owner && (d.qa_owner.full_name || d.qa_owner.name);
	let ownerStr = '<No Owner>';
	if (owner) {
		ownerStr = 'DEV: ' + owner + (qaOwner ? `, QA: ${qaOwner}` : '');
	} else if (qaOwner) {
		ownerStr = 'QA: ' + qaOwner;
	}
	return ownerStr;
};

const getDefectDetailsStr = (d) => {
	if (!d.severity) {
		console.log('############' + d.id);
	}
	return `${d.severity ? d.severity.name : '<No Severity>'} | ${d.phase ? d.phase.name : '<No Phase>'} | ${d.team ? d.team.name : '<No Team>'} | ${getDefectOwnersStr(d)} | #${d.id || '<No ID>'} | ${d.name || '<No Name>'}`;
};

// const compareDefects = (a, b) => {
// 	if (a.severity.logical_name === b.severity.logical_name) {
// 		if (a.phase.name === b.phase.name) {
// 			return 0;
// 		}
// 		return a.phase.name < b.phase.name ? -1 : 1;
// 	}
// 	return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
// };

const initCheckerResult = (checkerName) => {
	return {
		checkerName: checkerName,
		anomalies: {}
	}
};

const addDefectAnomaly = (checkerResult, d, text) => {
	checkerResult.anomalies[d.id] = {
		d: d,
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
