const _ = require('lodash');

const defaultOptions = {
	phasesBlackList: ['closed', 'fixed'],
	manyCommentsCount: 8
};

function check(defects, options) {
	options = options || {};
	_.defaults(options, defaultOptions);
	defects.forEach(d => {
		if ((options.phasesBlackList.indexOf(d.phase.name.toLowerCase()) === -1) && d.comments && d.comments['total_count'] && d.comments['total_count'] >= options.manyCommentsCount) {
			console.log(`Defect with many comments (${d.comments['total_count']}) | ${d.phase.name} | #${d.id} | ${d.name}`);
		}
	});
}

module.exports = {
	check: check
};
