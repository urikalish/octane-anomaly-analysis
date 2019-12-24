'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../helpers/defects-helper');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	defects.forEach(d => {
		if (d.phase
		&& d.severity
		&& !options.phasesToIgnore.includes(d.phase.logical_name)
		&& d['time_in_current_phase']) {
			const severityItem = options.phasesMaxDays[d.severity.logical_name] || options.phasesMaxDays['_DEFAULT'];
			const maxDays = severityItem[d.phase.logical_name.toLowerCase()] || severityItem['_DEFAULT'];
			const daysInCurrentPhase = Math.floor(d['time_in_current_phase'] / 1000 / 60 / 60 / 24);
			if (daysInCurrentPhase > maxDays) {
				helper.addDefectAnomaly(result, d, `Defect stuck in DEV phase (${daysInCurrentPhase} days)`);
			}
		}
	});
	return result;
};

module.exports = {
	check,
};
