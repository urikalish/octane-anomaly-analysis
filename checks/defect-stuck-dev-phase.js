'use strict';
const helper = require('../defects/defects-helper');

const check = async (defects, options, checkerName) => {
	let result = {checkerName: checkerName, anomalies: {}};
	defects.forEach(d => {
		if (d.phase && d.severity && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1 && d['time_in_current_phase']) {
			let severityItem = options.phasesMaxDays[d.severity.logical_name] || options.phasesMaxDays['_DEFAULT'];
			let maxDays = severityItem[d.phase.logical_name.toLowerCase()] || severityItem['_DEFAULT'];
			if (helper.getDaysInCurrentPhase(d) > maxDays) {
				result.anomalies[d.id] = {
					checkerName: checkerName,
					d: d,
					text: `Defect stuck in DEV phase (${helper.getDaysInCurrentPhase(d)} days) | ${helper.getDefectDetailsStr(d)}`
				};
			}
		}
	});
	return result;
};

module.exports = {
	check: check
};
