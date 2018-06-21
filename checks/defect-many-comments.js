'use strict';
const helper = require('../helper/helper');

function check(defects, options) {
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) && d.comments && d.comments['total_count'] && d.comments['total_count'] >= options.manyCommentsCount) {
			helper.logAnomaly(`Defect with many comments (${d.comments['total_count']}) | ${helper.getDefectDetailsStr(d)}`);
		}
	});
}

module.exports = {
	check: check
};
