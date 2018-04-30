'use strict';
//const _ = require('lodash');
const helper = require('../helper/helper');

function check(defects, options) {
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.name.toLowerCase()) === -1) && d.comments && d.comments['total_count'] && d.comments['total_count'] >= options.manyCommentsCount) {
			console.log(`Defect with many comments (${d.comments['total_count']}) | ${helper.getDefectDetailsStr(d)}`);
		}
	});
}

module.exports = {
	check: check
};
