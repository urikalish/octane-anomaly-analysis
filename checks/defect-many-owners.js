'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const _ = require('lodash');
const helper = require('../helpers/defects-helper');
const historyManager = require('../history/history-manager');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	const relevantDefects = {};
	const relevantDefectIds = [];
	defects.forEach(d => {
		if (!options.phasesToIgnore.includes(d.phase.name)) {
			relevantDefects[d.id] = d;
			relevantDefectIds.push(d.id);
		}
	});
	const historyLogsTimeRange = helper.getHistoryLogsTimeRange(Object.values(relevantDefects));
	const historyLogs = await historyManager.getHistoryLogs('owner', relevantDefectIds, historyLogsTimeRange.from, historyLogsTimeRange.to);
	const defectOwners = {};
	Object.values(relevantDefects).forEach(d => {
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
