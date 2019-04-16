'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../defects/defects-helper');

const check = async (defects, options) => {
	let result = helper.initCheckerResult(checkerName);
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) /*&& add conditions here...*/) {
			helper.addDefectAnomaly(result, d, `Defect with my anomaly (...)`);
		}
	});
	return result;
};

module.exports = {
	check: check
};
