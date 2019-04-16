'use strict';
const helper = require('../defects/defects-helper');

const check = async (defects, options, checkerName) => {
	let result = {checkerName: checkerName,	anomalies: {}};
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) /*&& add conditions here...*/) {
			result.anomalies[d.id] = {
				checkerName: checkerName,
				d: d,
				text: `Defect with my anomaly (...) | ${helper.getDefectDetailsStr(d)}`
			};
		}
	});
	return result;
};

module.exports = {
	check: check
};
