'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../defects/defects-helper');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	defects.forEach(d => {
		if (!options.phasesToIgnore.includes(d.phase.logical_name)
		&& !options.defectTypesToIgnore.includes(d.defect_type.logical_name)
		&& d.comments && d.comments['total_count']
		&& d.comments['total_count'] >= options.manyCommentsCount) {
			helper.addDefectAnomaly(result, d, `Defect with many comments (${d.comments['total_count']})`);
		}
	});
	return result;
};

module.exports = {
	check,
};
