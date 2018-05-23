'use strict';
const helper = require('../helper/helper');

function check(defects, options) {
    let defectsWithInactiveOwner = [];
    defects.forEach(d => {
        if (d.owner && d.owner.activity_level === 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
            defectsWithInactiveOwner.push(d);
        }
    });
    defectsWithInactiveOwner.forEach(d => {
        helper.logAnomaly(`Defect with an inactive DEV owner (${d.owner.full_name}) | ${helper.getDefectDetailsStr(d)} | ${helper.getLinkToEntity(d)}`);
    });
}

module.exports = {
    check: check
};
