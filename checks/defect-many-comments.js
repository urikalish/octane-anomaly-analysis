'use strict';
const helper = require('../defects/defects-helper');

function check(defects, checkerName, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
		defects.forEach(d => {
			if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) && d.comments && d.comments['total_count'] && d.comments['total_count'] >= options.manyCommentsCount) {
				anomalies[d.id] = {
					checkerName: checkerName,
					d: d,
					text: `Defect with many comments (${d.comments['total_count']}) | ${helper.getDefectDetailsStr(d)}`
				};
			}
		});
		resolve(anomalies);
	});
}

module.exports = {
	check: check
};
