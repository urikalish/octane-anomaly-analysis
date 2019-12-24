'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../helpers/defects-helper');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	defects.forEach(d => {
		if (d.owner && d.owner.activity_level === 1
		&& !options.phasesToIgnore.includes(d.phase.logical_name)) {
			helper.addDefectAnomaly(result, d, `Defect with an inactive DEV owner (${d.owner.full_name})`);
		}
	});
	return result;
};

module.exports = {
    check,
};
