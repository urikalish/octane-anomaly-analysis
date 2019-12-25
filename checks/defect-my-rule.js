'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../helpers/defects-helper');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	defects.forEach(d => {
		if (!options.phasesToIgnore.includes(d.phase.name) && false/*replace with real conditions...*/) {
			helper.addDefectAnomaly(result, d, `Defect with my anomaly (...)`);
		}
	});
	return result;
};

module.exports = {
	check,
};
