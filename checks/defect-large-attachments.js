'use strict';
const checkerName = require('path').basename(__filename).substring(0, require('path').basename(__filename).length - 3);
const helper = require('../helpers/defects-helper');
const octaneDataProvider = require('../octane/octane-data-provider');

const check = async (defects, options) => {
	const result = helper.initCheckerResult(checkerName);
	let relevantDefects = 0;
	let checkedDefects = 0;
	for (let i = 0; i < defects.length; i++) {
		const d = defects[i];
		if (!options.phasesToIgnore.includes(d.phase.logical_name)
		&& d.attachments && d.attachments['total_count']
		&& d.attachments['total_count'] > 0) {
			relevantDefects++;
			const promises = [];
			d.attachments.data.forEach(a => {
				if (a.type === 'attachment' && !options.fileExtensionsToIgnoreRegex.test(a.name.toLowerCase())) {
					promises.push(octaneDataProvider.getAttachment(a.id));
				}
			});
			let totalSizeMB = 0;
			const results = await Promise.all(promises);
			results.forEach(res => {
				if (res && res.data && res.data && res.data.length > 0) {
					totalSizeMB += res.data[0].size / 1048576;
				}
			});
			if (totalSizeMB > options.attachmentsLargeSizeMB) {
				helper.addDefectAnomaly(result, d, `Defect with large attachments (${Math.round(totalSizeMB)}MB)`);
			}
			checkedDefects++;
			if (checkedDefects === relevantDefects) {
				return result;
			}
		}
	}
	return result;
};

module.exports = {
	check,
};
