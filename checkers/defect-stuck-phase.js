'use strict';
const _ = require('lodash');
const defaultOptions = {
	phasesToIgnore: ['closed','rejected','duplicate'],
	phasesMaxDays: {
		'_DEFAULT': 90,
		'new': 90,
		'opened': 90,
		'fixed': 90
	}
};

function check(defects, options) {
	options = options || {};
	_.defaults(options, defaultOptions);
	defects.forEach(d => {
		if (options.phasesToIgnore.indexOf(d.phase.name.toLowerCase()) === -1 && d['time_in_current_phase']) {
			let days = Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
			let maxDays = options.phasesMaxDays[d.phase.name.toLowerCase()] || options.phasesMaxDays['_DEFAULT'];
			if (days > maxDays) {
				let owner = d.owner && (d.owner.full_name || d.owner.name);
				let qaOwner = d.qa_owner && (d.qa_owner.full_name || d.qa_owner.name);
				let ownerStr = '<No Owners>';
				if (owner) {
					ownerStr = 'DEV: ' + owner + (qaOwner ? `, QA: ${qaOwner}` : '');
				} else if (qaOwner) {
					ownerStr = 'QA: ' + qaOwner;
				}

				console.log(`Defect stuck in phase (${d.phase.name} - ${days} days) | ${ownerStr} | #${d.id} | ${d.name}`);
			}
		}
	});
}

module.exports = {
	check: check
};