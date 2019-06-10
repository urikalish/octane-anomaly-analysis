'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const _ = require('lodash');
const helper = require('../defects/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');

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
	const historyResults = await octaneDataProvider.getHistories(relevantDefectIds);
	if (historyResults) {
		const defectOwners = {};
		historyResults.data.forEach(h => {
			if (h['property_name'] === 'owner') {
				if (!defectOwners[h.entity_id]) {
					defectOwners[h.entity_id] = [];
				}
				if (h['new_value']) {
					defectOwners[h.entity_id].push((h['new_value'].replace(/<html><body>/g, '').replace(/<\/body><\/html>/g, '').trim()));
				} else {
					defectOwners[h.entity_id].push('<empty>');
				}
			}
		});
		_.forEach(defectOwners, (owners, defectId) => {
			if (owners.length >= options.manyOwnersCount) {
				helper.addDefectAnomaly(result, relevantDefects[defectId], `Defect with many owners (${owners.length} - ${owners})`);
			}
		});
	}
	return result;
};

module.exports = {
	check,
};
