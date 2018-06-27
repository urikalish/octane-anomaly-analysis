'use strict';
const helper = require('../defects/defects-helper');

function check(defects, checkerName, options) {
    return new Promise((resolve /*, reject*/) => {
        let anomalies = {};
		defects.forEach(d => {
			if (d.owner && d.owner.activity_level === 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				anomalies[d.id] = {
					checkerName: checkerName,
					d: d,
					text: `Defect with an inactive DEV owner (${d.owner.full_name}) | ${helper.getDefectDetailsStr(d)}`
                };
			}
		});
		resolve(anomalies);
	});
}

module.exports = {
    check: check
};
