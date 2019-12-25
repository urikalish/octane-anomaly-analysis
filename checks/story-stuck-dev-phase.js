'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../helpers/stories-helper');

const check = async (stories, options) => {
	const result = helper.initCheckerResult(checkerName);
	stories.forEach(s => {
		if (s.phase
		&& !options.phasesToIgnore.includes(s.phase.name)
		&& s['time_in_current_phase']) {
			const maxDays = options.phasesMaxDays[s.phase.name] || options.phasesMaxDays['_DEFAULT'];
		 	const daysInCurrentPhase = Math.floor(s['time_in_current_phase'] / 1000 / 60 / 60 / 24);
		 	if (daysInCurrentPhase > maxDays) {
		 		helper.addStoryAnomaly(result, s, `Story stuck in DEV phase (${daysInCurrentPhase} days)`);
		 	}
		}
	});
	return result;
};

module.exports = {
	check,
};
