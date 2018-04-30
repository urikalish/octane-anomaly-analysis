'use strict';
//const _ = require('lodash');
const dataProvider = require('../data/data-provider');

function check(defects, options) {
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.name.toLowerCase()) === -1) && d.attachments && d.attachments['total_count'] && d.attachments['total_count'] > 0) {
			let promises = [];
			d.attachments.data.forEach(a => {
				if (a.type === 'attachment' && !options.fileExtensionsToIgnoreRegex.test(a.name.toLowerCase())) {
					promises.push(dataProvider.getAttachment(a.id));
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
					if (totalSizeMB > options.attachmentsMaxSizeMB) {
						console.log(`Defect with large attachments (${Math.round(totalSizeMB)}MB) | ${d.severity.name} | ${d.phase.name} | #${d.id} | ${d.name}`);
					}
				}
			);
		}
	});
}

module.exports = {
	check: check
};
