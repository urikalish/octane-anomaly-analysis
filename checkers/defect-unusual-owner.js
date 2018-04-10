const _ = require('lodash');

const defaultOptions = {
	phasesBlackList: ['closed', 'fixed'],
};

function check(defects, options) {
	options = options || {};
	_.defaults(options, defaultOptions);
	let unusualOwners = {};
	defects.forEach(d => {
		if (d.owner) {
			let ownerName = d.owner.full_name || d.owner.name;
			if (unusualOwners[ownerName]) {
				unusualOwners[ownerName].count++;
			} else {
				unusualOwners[ownerName] = {
					count: 1,
					firstDefect: d
				};
			}
		}
	});
	_.keys(unusualOwners).forEach(o => {
		if ((unusualOwners[o].count === 1) && (options.phasesBlackList.indexOf(unusualOwners[o].firstDefect.phase.name.toLowerCase()) === -1)) {
			console.log(`Defect with an unusual owner (${o}) | ${unusualOwners[o].firstDefect.phase.name} | #${unusualOwners[o].firstDefect.id} | ${unusualOwners[o].firstDefect.name}`);
		}
	});
}

module.exports = {
	check: check
};
