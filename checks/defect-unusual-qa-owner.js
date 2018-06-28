'use strict';
const _ = require('lodash');
const helper = require('../defects/defects-helper');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let result = {
			checkerName: checkerName,
			anomalies: {}
		};
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
	            result.anomalies[d.id] = {
		            checkerName: checkerName,
		            d: d,
		            text: `Defect with an unusual QA owner (${o}) | ${helper.getDefectDetailsStr(d)}`
	            };
            }
        });
		resolve(result);
	});
}

module.exports = {
    check: check
};
