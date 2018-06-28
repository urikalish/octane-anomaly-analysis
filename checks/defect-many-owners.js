'use strict';
const helper = require('../defects/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let result = {
			checkerName: checkerName,
			anomalies: {}
		};
		let relevantDefects = 0;
		let checkedDefects = 0;
		defects.forEach(d => {
			if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				relevantDefects++;
				octaneDataProvider.getHistory(d.id).then((historyResult) => {
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
					checkedDefects++;
					if (checkedDefects === relevantDefects) {
						resolve(result);
					}
				});
			}
		});
	});
}

module.exports = {
	check: check
};
