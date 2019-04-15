'use strict';
const _ = require('lodash');
const helper = require('../defects/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

const check = async (defects, options) => {
	let result = {
		checkerName: checkerName,
		anomalies: {}
	};
	let relevantDefects = {};
	let relevantDefectIds = [];
	defects.forEach(d => {
		if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
			relevantDefects[d.id] = d;
			relevantDefectIds.push(d.id);
		}
	});
	let historyResults = await octaneDataProvider.getHistories(relevantDefectIds);
	if (historyResults) {
		let defectOwners = {};
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
		_.forEach(defectOwners, (owners, id) => {
			if (owners.length >= options.manyOwnersCount) {
				result.anomalies[id] = {
					checkerName: checkerName,
					d: relevantDefects[id],
					text: `Defect with many owners (${owners.length} - ${owners}) | ${helper.getDefectDetailsStr(relevantDefects[id])}`
				};
			}
		});
	}
	return result;
};

module.exports = {
	check: check
};
