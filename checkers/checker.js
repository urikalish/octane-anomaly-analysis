'use strict';
const _ = require('lodash');
const helper = require('../helper/helper');
const checkersConfig = require('../config/checkers-config');
const dataProvider = require('../data/data-provider');

function check() {
	helper.logMessage('Retrieving defects...');
	dataProvider.getDefects(checkersConfig.defectsTotalDataSetSize).then(
	(defects) => {
		helper.logSuccess('Retrieving defects - OK');
		helper.logMessage('Checking for anomalies...');
		checkersConfig.checkers.forEach(c => {
			if (_.isUndefined(c.enabled) || c.enabled) {
				let checker = require(`./${c.name}`);
				checker.check(defects, c.options);
			}
		});
	});
}

module.exports = {
	check: check
};
