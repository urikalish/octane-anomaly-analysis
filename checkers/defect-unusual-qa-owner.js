'use strict';
const _ = require('lodash');
const helper = require('../helper/helper');

function check(defects, options) {
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
            helper.logAnomaly(`Defect with an unusual QA owner (${o}) | ${helper.getDefectDetailsStr(d)} | ${helper.getLinkToEntity(d)}`);
        }
    });
}

module.exports = {
    check: check
};
