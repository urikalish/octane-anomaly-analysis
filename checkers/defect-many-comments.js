'use strict';
const _ = require('lodash');

function check(defects, options) {
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.name.toLowerCase()) === -1) && d.comments && d.comments['total_count'] && d.comments['total_count'] >= options.manyCommentsCount) {
			console.log(`Defect with many comments (${d.comments['total_count']}) | ${d.severity.name} | ${d.phase.name} | #${d.id} | ${d.name}`);
		}
	});
}

module.exports = {
	check: check
};
