const _ = require('lodash');
const dataProvider = require('../data-provider');

const defaultOptions = {
	phasesToIgnore: ['closed'],
	fileExtensionsToIgnore: ['.png','.jpg'],
	attachmentMaxSizeMB: 5,
};

function check(defects, options) {
	options = options || {};
	_.defaults(options, defaultOptions);
	defects.forEach(d => {
		if ((options.phasesToIgnore.indexOf(d.phase.name.toLowerCase()) === -1) && d.attachments && d.attachments['total_count'] && d.attachments['total_count'] > 0) {
			d.attachments.data.forEach(a => {
				if (a.type === 'attachment') {
					let ignore = false;
					options.fileExtensionsToIgnore.forEach(e => {
						if (_.endsWith(a.name.toLowerCase(), e)) {
							ignore = true;
						}
					});
					if (!ignore) {
						dataProvider.getAttachment(a.id).then(
						(result) => {
							if (result.data && result.data && result.data.length > 0 && Math.round(result.data[0].size/1048576) > options.attachmentMaxSizeMB) {
								console.log(`Defect with a large attachment (${Math.round(result.data[0].size/1048576)}MB) | ${d.phase.name} | #${d.id} | ${d.name}`);
							}
						}
						);
					}
				}
			});
		}
	});
}

module.exports = {
	check: check
};
