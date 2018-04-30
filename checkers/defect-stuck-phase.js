'use strict';
const helper = require('../helper/helper');

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
		let compare = helper.compareDefects(a, b);
		return (compare !== 0) ? compare : getDaysInCurrentPhase(b) - getDaysInCurrentPhase(a);
	});
	stuckDefects.forEach(d => {
		console.log(`Defect stuck in phase (${getDaysInCurrentPhase(d)} days) | ${helper.getDefectDetailsStr(d)}`);
	});
}

module.exports = {
	check: check
};
