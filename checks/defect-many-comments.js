'use strict';
const helper = require('../defects/defects-helper');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let result = {
			checkerName: checkerName,
			anomalies: {}
		};
		defects.forEach(d => {
			if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) && d.comments && d.comments['total_count'] && d.comments['total_count'] >= options.manyCommentsCount) {
				result.anomalies[d.id] = {
					checkerName: checkerName,
					d: d,
					text: `Defect with many comments (${d.comments['total_count']}) | ${helper.getDefectDetailsStr(d)}`
				};
			}
		});
		resolve(result);
	});
}

module.exports = {
	check: check
};
