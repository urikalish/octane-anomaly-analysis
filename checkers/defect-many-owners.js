'use strict';
const helper = require('../helper/helper');
const dataProvider = require('../data/data-provider');

function check(defects, options) {
	defects.forEach(d => {
		if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
			dataProvider.getHistory(d.id).then(
			(result) => {
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
					helper.logAnomaly(`Defect with many owners (${ownerCount} - ${owners}) | ${helper.getDefectDetailsStr(d)} | ${helper.getLinkToEntity(d)}`);
				}
			}
			);
		}
	});
}

module.exports = {
	check: check
};
