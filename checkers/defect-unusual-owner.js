'use strict';
const _ = require('lodash');

function check(defects, options) {
	let unusualOwners = {};
	let count = 0;
	defects.forEach(d => {
		count++;
		if (count <= options.maxDataSetSize && d.owner) {
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
		if ((unusualOwners[o].count === 1) && (options.phasesToIgnore.indexOf(unusualOwners[o].firstDefect.phase.name.toLowerCase()) === -1)) {
			let d = unusualOwners[o].firstDefect;
			console.log(`Defect with an unusual owner (${o}) | ${d.severity.name} | ${d.phase.name} | #${d.id} | ${d.name}`);
		}
	});
}

module.exports = {
	check: check
};
