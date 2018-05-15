'use strict';
const helper = require('../helper/helper');

function check(defects, options) {
    let defectsWithInactiveQAOwner = [];
    defects.forEach(d => {
        if (d.qa_owner && d.qa_owner.activity_level === 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
            defectsWithInactiveQAOwner.push(d);
        }
    });
    defectsWithInactiveQAOwner.forEach(d => {
        helper.logAnomaly(`Defect with an inactive QA owner (${d.qa_owner.full_name}) | ${helper.getDefectDetailsStr(d)}`);
    });
}

module.exports = {
    check: check
};
