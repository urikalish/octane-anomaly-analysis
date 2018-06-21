'use strict';
const _ = require('lodash');
const helper = require('../helper/helper');
const checkersConfig = require('../config/checkers-config');
const octaneDataProvider = require('../octane/octane-data-provider');

function check() {
	helper.logMessage('Retrieving defects...');
	octaneDataProvider.getLastDefects(checkersConfig.defectsTotalDataSetSize).then((lastDefects) => {
		helper.logSuccess('Defects retrieved - OK');
		helper.logMessage('Checking for anomalies...');
		checkersConfig.checkers.forEach(c => {
			if (_.isUndefined(c.enabled) || c.enabled) {
				let checker = require(`./${c.name}`);
				checker.check(lastDefects, c.options);
			}
		});
	});
}

module.exports = {
	check: check
};
