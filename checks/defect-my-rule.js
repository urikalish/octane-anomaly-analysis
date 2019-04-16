'use strict';
const helper = require('../defects/defects-helper');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

const check = async (defects, options) => {
	let result = {
		checkerName: checkerName,
		anomalies: {}
	};
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
