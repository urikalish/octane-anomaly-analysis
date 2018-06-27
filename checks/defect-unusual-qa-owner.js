'use strict';
const _ = require('lodash');
const helper = require('../defects/defects-helper');

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
        let unusualQAOwners = {};
        let count = 0;
        defects.forEach(d => {
            count++;
            if (count <= options.maxDataSetSize && d.qa_owner) {
                let ownerName = d.qa_owner.full_name || d.qa_owner.name;
                if (unusualQAOwners[ownerName]) {
                    unusualQAOwners[ownerName].count++;
                } else {
                    unusualQAOwners[ownerName] = {
                        count: 1,
                        firstDefect: d
                    };
                }
            }
        });
        _.keys(unusualQAOwners).forEach(o => {
            if ((unusualQAOwners[o].count === 1) && (options.phasesToIgnore.indexOf(unusualQAOwners[o].firstDefect.phase.logical_name) === -1)) {
                let d = unusualQAOwners[o].firstDefect;
	            anomalies[d.id] = {
		            d: d,
		            text: `Defect with an unusual QA owner (${o}) | ${helper.getDefectDetailsStr(d)}`
	            };
            }
        });
		resolve(anomalies);
	});
}

module.exports = {
    check: check
};
