'use strict';
const helper = require('../defects/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let anomalies = {};
		let relevantDefects = 0;
		let checkedDefects = 0;
		defects.forEach(d => {
			if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) && d.attachments && d.attachments['total_count'] && d.attachments['total_count'] > 0) {
				relevantDefects++;
				let promises = [];
				d.attachments.data.forEach(a => {
					if (a.type === 'attachment' && !options.fileExtensionsToIgnoreRegex.test(a.name.toLowerCase())) {
						promises.push(octaneDataProvider.getAttachment(a.id));
					}
				});
				let totalSizeMB = 0;
				Promise.all(promises).then((results) => {
					results.forEach(result => {
						if (result.data && result.data && result.data.length > 0) {
							totalSizeMB += result.data[0].size/1048576;
						}
					});
					if (totalSizeMB > options.attachmentsLargeSizeMB) {
						anomalies[d.id] = {
							d: d,
							text: `Defect with large attachments (${Math.round(totalSizeMB)}MB) | ${helper.getDefectDetailsStr(d)}`
						};
					}
					checkedDefects++;
					if (checkedDefects === relevantDefects) {
						resolve(anomalies);
					}
				});
			}
		});
	});
}

module.exports = {
	check: check
};
