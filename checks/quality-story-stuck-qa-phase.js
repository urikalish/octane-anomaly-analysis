'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../helpers/quality-stories-helper');

const check = async (stories, options) => {
	const result = helper.initCheckerResult(checkerName);
	stories.forEach(qs => {
		if (qs.phase
		&& !options.phasesToIgnore.includes(qs.phase.name)
		&& qs['time_in_current_phase']) {
			const maxDays = options.phasesMaxDays[qs.phase.name] || options.phasesMaxDays['_DEFAULT'];
		 	const daysInCurrentPhase = Math.floor(qs['time_in_current_phase'] / 1000 / 60 / 60 / 24);
		 	if (daysInCurrentPhase > maxDays) {
		 		helper.addQualityStoryAnomaly(result, qs, `Quality story stuck in QA phase (${daysInCurrentPhase} days)`);
		 	}
		}
	});
	return result;
};

module.exports = {
	check,
};
