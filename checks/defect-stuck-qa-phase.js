'use strict';
const helper = require('../defects/defects-helper');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

function getDaysInCurrentPhase(d) {
	return Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
}

async function check(defects, options) {
	let result = {
		checkerName: checkerName,
		anomalies: {}
	};
	//let stuckDefects = [];
	defects.forEach(d => {
		if (d.phase && d.severity && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1 && d['time_in_current_phase']) {
			let severityItem = options.phasesMaxDays[d.severity.logical_name] || options.phasesMaxDays['_DEFAULT'];
			let maxDays = severityItem[d.phase.logical_name.toLowerCase()] || severityItem['_DEFAULT'];
			if (getDaysInCurrentPhase(d) > maxDays) {
				result.anomalies[d.id] = {
					checkerName: checkerName,
					d: d,
					text: `Defect stuck in QA phase (${getDaysInCurrentPhase(d)} days) | ${helper.getDefectDetailsStr(d)}`
				};
			}
		}
	});
	return result;
}

module.exports = {
	check: check
};
