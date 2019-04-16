'use strict';
const helper = require('../defects/defects-helper');

const check = async (defects, options, checkerName) => {
	let result = {checkerName: checkerName, anomalies: {}};
	defects.forEach(d => {
		if (d.owner && d.owner.activity_level === 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
			result.anomalies[d.id] = {
				checkerName: checkerName,
				d: d,
				text: `Defect with an inactive DEV owner (${d.owner.full_name}) | ${helper.getDefectDetailsStr(d)}`
            };
		}
	});
	return result;
};

module.exports = {
    check: check
};
