'use strict';
const helper = require('../helper/helper');

function check(defects, options) {
    let defectsWithNonActiveUsers = [];
    defects.forEach(d => {
        if (d.owner) {
            if (d.owner.activity_level == 1 && options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) {
                defectsWithNonActiveUsers.push(d);
            }
        }
    });
    defectsWithNonActiveUsers.forEach(d => {
        helper.logAnomaly(`Defect with a non active owner | ${helper.getDefectDetailsStr(d)}`);
    });
}

module.exports = {
    check: check
};
