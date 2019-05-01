'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const _ = require('lodash');
const helper = require('../defects/defects-helper');

const check = async (defects, options) => {
	let result = helper.initCheckerResult(checkerName);
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
			if ((unusualOwners[o].count === 1)
			&& !options.phasesToIgnore.includes(unusualOwners[o].firstDefect.phase.logical_name)) {
				let d = unusualOwners[o].firstDefect;
				if (!result.anomalies[d.id]) {
					helper.addDefectAnomaly(result, d, `Defect with an unusual QA owner (${o})`);
				}
			}
		});
	});
	return result;
};

module.exports = {
    check: check
};
