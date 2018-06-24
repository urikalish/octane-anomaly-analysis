'use strict';
const helper = require('../helper/helper');
const octaneDataProvider = require('../octane/octane-data-provider');

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
		let relevantDefects = 0;
		let checkedDefects = 0;
		defects.forEach(d => {
			if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				relevantDefects++;
				octaneDataProvider.getHistory(d.id).then((result) => {
					let owners = [];
					let ownerCount = 0;
					result.data.forEach(h => {
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
						anomalies[d.id] = {
							d: d,
							text: `Defect with many owners (${ownerCount} - ${owners}) | ${helper.getDefectDetailsStr(d)}`
						};
					}
					checkedDefects++;
					if (checkedDefects === relevantDefects) {
						resolve(anomalies);
					}
				});
			}
		});
	});
}

module.exports = {
	check: check
};
