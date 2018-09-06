'use strict';
//const _ = require('lodash');
const helper = require('../defects/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

function check(defects, options) {
	return new Promise((resolve/*,reject*/) => {
		let result = {
			checkerName: checkerName,
			anomalies: {}
		};
		let relevantDefects = 0;
		defects.forEach(d => {
			if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				relevantDefects++;
			}
		});
		let checkedDefects = 0;
		defects.forEach(d => {
			if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				octaneDataProvider.getHistory(d.id).then(
				(historyResult) => {
					if (historyResult) {
						let owners = [];
						let ownerCount = 0;
						historyResult.data.forEach(h => {
							if (h['property_name'] === 'owner') {
								if (h['new_value']) {
									owners.push((h['new_value'].replace(/<html><body>/g, '').replace(/<\/body><\/html>/g, '').trim()));
									ownerCount++;
								} else {
									owners.push('<empty>');
								}
							}
						});
						if (ownerCount >= options.manyOwnersCount) {
							result.anomalies[d.id] = {
								checkerName: checkerName,
								d: d,
								text: `Defect with many owners (${ownerCount} - ${owners}) | ${helper.getDefectDetailsStr(d)}`
							};
						}
					}
					checkedDefects++;
					if (checkedDefects === relevantDefects) {
						resolve(result);
					}
				});
			}
		});
	});
}

// function check(defects, options) {
// 	return new Promise((resolve/*,reject*/) => {
// 		let result = {
// 			checkerName: checkerName,
// 			anomalies: {}
// 		};
// 		let relevantDefects = {};
// 		let relevantDefectIds = [];
// 		defects.forEach(d => {
// 			if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
// 				relevantDefects[d.id] = d;
// 				relevantDefectIds.push(d.id);
// 			}
// 		});
// 		octaneDataProvider.getHistories(relevantDefectIds).then(historyResults => {
// 			if (historyResults) {
// 				let defectOwners = {};
// 				historyResults.data.forEach(h => {
// 					if (h['property_name'] === 'owner') {
// 						if (!defectOwners[h.entity_id]) {
// 							defectOwners[h.entity_id] = [];
// 						}
// 						if (h['new_value']) {
// 							defectOwners[h.entity_id].push((h['new_value'].replace(/<html><body>/g, '').replace(/<\/body><\/html>/g, '').trim()));
// 						} else {
// 							defectOwners[h.entity_id].push('<empty>');
// 						}
// 					}
// 				});
// 				_.forEach(defectOwners, (owners, id) => {
// 					if (owners.length >= options.manyOwnersCount) {
// 						result.anomalies[id] = {
// 							checkerName: checkerName,
// 							d: relevantDefects[id],
// 							text: `Defect with many owners (${owners.length} - ${owners}) | ${helper.getDefectDetailsStr(relevantDefects[id])}`
// 						};
// 					}
// 				});
// 			}
// 			resolve(result);
// 		});
// 	});
// }

module.exports = {
	check: check
};
