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
		options.dataSetSizes.forEach(ds => {
			let count = 0;
			let unusualOwners = {};
			defects.forEach(d => {
				count++;
				if (count <= ds && d.qa_owner) {
					let ownerName = d.qa_owner.full_name || d.qa_owner.name;
					if (unusualOwners[ownerName]) {
						unusualOwners[ownerName].count++;
					} else {
						unusualOwners[ownerName] = {
							count: 1,
							firstDefect: d
						};
					}
				}
			});
			_.keys(unusualOwners).forEach(o => {
				if ((unusualOwners[o].count === 1) && (options.phasesToIgnore.indexOf(unusualOwners[o].firstDefect.phase.logical_name) === -1)) {
					let d = unusualOwners[o].firstDefect;
					if (!result.anomalies[d.id]) {
						result.anomalies[d.id] = {
							checkerName: checkerName,
							d: d,
							text: `Defect with an unusual QA owner (${o}) | ${helper.getDefectDetailsStr(d)}`
						};
					}
				}
			});
		});
		resolve(result);
	});
}

module.exports = {
    check: check
};
