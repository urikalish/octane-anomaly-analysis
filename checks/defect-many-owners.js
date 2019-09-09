'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const _ = require('lodash');
const settings = require('../.settings');
const helper = require('../defects/defects-helper');
const historyManager = require('../history/history-manager');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	const relevantDefects = {};
	const relevantDefectIds = [];
	defects.forEach(d => {
		if (!options.phasesToIgnore.includes(d.phase.logical_name)) {
			relevantDefects[d.id] = d;
			relevantDefectIds.push(d.id);
		}
	});
	const historyLogsTimestampFrom = settings.historyLogsTimestampFrom || '1970-01-01T00:00:00Z';
	const historyLogsTimestampTo = settings.historyLogsTimestampTo || '2030-01-01T00:00:00Z';
	const historyLogs = await historyManager.getHistoryLogs('owner', relevantDefectIds, historyLogsTimestampFrom, historyLogsTimestampTo);
	const defectOwners = {};
	defects.forEach(d => {
		if (historyLogs[d.id]) {
			defectOwners[d.id] = [];
			historyLogs[d.id].forEach(change => {
				defectOwners[d.id].push(change.value || '<empty>');
			})
		}
	});
	_.forEach(defectOwners, (owners, defectId) => {
		if (owners.length >= options.manyOwnersCount) {
			helper.addDefectAnomaly(result, relevantDefects[defectId], `Defect with many owners (${owners.length} - ${owners})`);
		}
	});
	return result;
};

module.exports = {
	check,
};
