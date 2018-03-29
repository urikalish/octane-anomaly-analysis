const _ = require('lodash');

function checkUnusualOwner(defects) {
	let owners = {};
	defects.forEach(d => {
		if (d.owner) {
			let ownerName = d.owner.full_name || d.owner.name;
			if (owners[ownerName]) {
				owners[ownerName].count++;
			} else {
				owners[ownerName] = {
					count: 1,
					firstDefect: d
				};
			}
		}
	});
	_.keys(owners).forEach(o => {
		if (owners[o].count === 1) {
			console.log(`Defect with an unusual owner | ${o} | ${owners[o].firstDefect.phase.name} | #${owners[o].firstDefect.id} | ${owners[o].firstDefect.name}`);
		}
	});
}

module.exports = {
	checkUnusualOwner: checkUnusualOwner
};