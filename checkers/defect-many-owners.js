const _ = require('lodash');
const dataProvider = require('../data-provider');

const defaultOptions = {
	phasesBlackList: ['closed', 'fixed', 'rejected'],
	ownersMinCount: 5
};

function check(defects, options) {
	options = options || {};
	_.defaults(options, defaultOptions);
	defects.forEach(d => {
		if (options.phasesBlackList.indexOf(d.phase.name.toLowerCase()) === -1) {
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
				if (ownerCount >= options.ownersMinCount) {
					console.log(`Defect with many owners (${owners}) | ${d.phase.name} | #${d.id} | ${d.name}`);
				}
			}
			);
		}
	});
}

module.exports = {
	check: check
};
