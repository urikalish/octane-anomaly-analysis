'use strict';
const helper = require('../helper/helper');
const octaneDataProvider = require('../octane/octane-data-provider');

function check(defects, options) {
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.logical_name) === -1) && d.attachments && d.attachments['total_count'] && d.attachments['total_count'] > 0) {
			let promises = [];
			d.attachments.data.forEach(a => {
				if (a.type === 'attachment' && !options.fileExtensionsToIgnoreRegex.test(a.name.toLowerCase())) {
					promises.push(octaneDataProvider.getAttachment(a.id));
				}
			});
			let totalSizeMB = 0;
			Promise.all(promises).then(
				(results) => {
					results.forEach(result => {
						if (result.data && result.data && result.data.length > 0) {
							totalSizeMB += result.data[0].size/1048576;
						}
					});
					if (totalSizeMB > options.attachmentsLargeSizeMB) {
						helper.logAnomaly(`Defect with large attachments (${Math.round(totalSizeMB)}MB) | ${helper.getDefectDetailsStr(d)}`);
					}
				}
			);
		}
	});
}

module.exports = {
	check: check
};
