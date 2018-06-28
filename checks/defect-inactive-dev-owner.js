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
			if (d.owner && d.owner.activity_level === 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				result.anomalies[d.id] = {
					d: d,
					text: `Defect with an inactive DEV owner (${d.owner.full_name}) | ${helper.getDefectDetailsStr(d)}`
                };
			}
		});
		resolve(result);
	});
}

module.exports = {
    check: check
};
