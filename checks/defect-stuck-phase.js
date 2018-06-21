'use strict';
const helper = require('../helper/helper');

function getDaysInCurrentPhase(d) {
	return Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
}

function check(defects, options) {
	let stuckDefects = [];
	defects.forEach(d => {
		if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1 && d['time_in_current_phase']) {
			let severityItem = options.phasesMaxDays[d.severity.logical_name] || options.phasesMaxDays['_DEFAULT'];
			let maxDays = severityItem[d.phase.logical_name.toLowerCase()] || severityItem['_DEFAULT'];
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
		helper.logAnomaly(`Defect stuck in phase (${getDaysInCurrentPhase(d)} days) | ${helper.getDefectDetailsStr(d)}`);
	});
}

module.exports = {
	check: check
};
