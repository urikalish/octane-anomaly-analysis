'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../defects/defects-helper');

const check = async (defects, options) => {
	let result = helper.initCheckerResult(checkerName);
	defects.forEach(d => {
		if (d.phase && d.severity && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1 && d['time_in_current_phase']) {
			let severityItem = options.phasesMaxDays[d.severity.logical_name] || options.phasesMaxDays['_DEFAULT'];
			let maxDays = severityItem[d.phase.logical_name.toLowerCase()] || severityItem['_DEFAULT'];
			let daysInCurrentPhase = Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
			if (daysInCurrentPhase > maxDays) {
				helper.addDefectAnomaly(result, d, `Defect stuck in QA phase (${daysInCurrentPhase} days)`);
			}
		}
	});
	return result;
};

module.exports = {
	check: check
};
