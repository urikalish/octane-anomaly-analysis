const _ = require('lodash');

const defaultOptions = {
	phasesBlackList: ['closed', 'fixed', 'rejected'],
	suspiciousMaxCount: 1
};

function check(defects, options) {
	let owners = {};
	options = options || {};
	_.defaults(options, defaultOptions);
	defects.forEach(d => {
		if ((options.phasesBlackList.indexOf(d.phase.name.toLowerCase()) === -1) && d.owner) {
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
		if (owners[o].count <= options.suspiciousMaxCount) {
			console.log(`Defect with an unusual owner (${o}) | ${owners[o].firstDefect.phase.name} | #${owners[o].firstDefect.id} | ${owners[o].firstDefect.name}`);
		}
	});
}

module.exports = {
	check: check
};