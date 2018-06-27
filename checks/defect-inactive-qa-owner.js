'use strict';
const helper = require('../defects/defects-helper');

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
		defects.forEach(d => {
			if (d.qa_owner && d.qa_owner.activity_level === 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
				anomalies[d.id] = {
					d: d,
					text: `Defect with an inactive QA owner (${d.qa_owner.full_name}) | ${helper.getDefectDetailsStr(d)}`
				};
			}
		});
		resolve(anomalies);
	});
}

module.exports = {
    check: check
};
