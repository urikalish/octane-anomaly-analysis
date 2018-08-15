'use strict';
const helper = require('../defects/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);

function check(defects, options) {
	return new Promise((resolve /*, reject*/) => {
		let result = {
			checkerName: checkerName,
			anomalies: {}
		};
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
						if (result && result.data && result.data && result.data.length > 0) {
							totalSizeMB += result.data[0].size/1048576;
						}
					});
					if (totalSizeMB > options.attachmentsLargeSizeMB) {
						result.anomalies[d.id] = {
							checkerName: checkerName,
							d: d,
							text: `Defect with large attachments (${Math.round(totalSizeMB)}MB) | ${helper.getDefectDetailsStr(d)}`
						};
					}
					checkedDefects++;
					if (checkedDefects === relevantDefects) {
						resolve(result);
					}
				});
			}
		});
	});
}

module.exports = {
	check: check
};
