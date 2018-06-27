'use strict';
const _ = require('lodash');
const helper = require('../defects/defects-helper');

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
		let unusualOwners = {};
		let count = 0;
		defects.forEach(d => {
			count++;
			if (count <= options.maxDataSetSize && d.owner) {
				let ownerName = d.owner.full_name || d.owner.name;
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
				anomalies[d.id] = {
					d: d,
					text: `Defect with an unusual DEV owner (${o}) | ${helper.getDefectDetailsStr(d)}`
				};
			}
		});
		resolve(anomalies);
	});
}

module.exports = {
	check: check
};
