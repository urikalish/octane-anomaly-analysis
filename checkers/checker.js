'use strict';
const _ = require('lodash');
const checkersConfig = require('../config/checkers-config');
const dataProvider = require('../data/data-provider');

function check() {
	dataProvider.getDefects(checkersConfig.defectsTotalDataSetSize).then(
	(defects) => {
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
