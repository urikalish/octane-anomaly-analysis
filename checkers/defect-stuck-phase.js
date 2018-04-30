'use strict';
//const _ = require('lodash');

function getOwnerStr(d) {
	let owner = d.owner && (d.owner.full_name || d.owner.name);
	let qaOwner = d.qa_owner && (d.qa_owner.full_name || d.qa_owner.name);
	let ownerStr = '<No Owners>';
	if (owner) {
		ownerStr = 'DEV: ' + owner + (qaOwner ? `, QA: ${qaOwner}` : '');
	} else if (qaOwner) {
		ownerStr = 'QA: ' + qaOwner;
	}
	return ownerStr;
}

function getDaysInCurrentPhase(d) {
	return Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
}

function check(defects, options) {
	let stuckDefects = [];
	defects.forEach(d => {
		if (options.phasesToIgnore.indexOf(d.phase.name.toLowerCase()) === -1 && d['time_in_current_phase']) {
			let maxDays = options.phasesMaxDays[d.phase.name.toLowerCase()] || options.phasesMaxDays['_DEFAULT'];
			if (getDaysInCurrentPhase(d) > maxDays) {
				stuckDefects.push(d);
			}
		}
	});
	stuckDefects.sort((a, b) => {
		if (a.phase.name === b.phase.name) {
			return getDaysInCurrentPhase(b) - getDaysInCurrentPhase(a);
		}
		return a.phase.name < b.phase.name ? -1 : 1;
	});
	stuckDefects.forEach(d => {
		console.log(`Defect stuck in phase (${d.phase.name} - ${getDaysInCurrentPhase(d)} days) | ${d.severity.name} | ${d.phase.name} | ${getOwnerStr(d)} | #${d.id} | ${d.name}`);
	});
}

module.exports = {
	check: check
};