'use strict';
const helper = require('../defects/defects-helper');

function getDaysInCurrentPhase(d) {
	return Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
}

function check(defects, checkerName, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
		//let stuckDefects = [];
		defects.forEach(d => {
			if (options.phasesToIgnore.indexOf(d.phase.logical_name) === -1 && d['time_in_current_phase']) {
				let severityItem = options.phasesMaxDays[d.severity.logical_name] || options.phasesMaxDays['_DEFAULT'];
				let maxDays = severityItem[d.phase.logical_name.toLowerCase()] || severityItem['_DEFAULT'];
				if (getDaysInCurrentPhase(d) > maxDays) {
					anomalies[d.id] = {
						checkerName: checkerName,
						d: d,
						text: `Defect stuck in phase (${getDaysInCurrentPhase(d)} days) | ${helper.getDefectDetailsStr(d)}`
					};
				}
			}
		});
		resolve(anomalies);
		// stuckDefects.sort((a, b) => {
		// 	let compare = helper.compareDefects(a, b);
		// 	return (compare !== 0) ? compare : getDaysInCurrentPhase(b) - getDaysInCurrentPhase(a);
		// });
	});
}

module.exports = {
	check: check
};
