'use strict';
const checkersConfig = require('../config/checkers-config');
const helper = require('../helper/helper');
const octaneDataProvider = require('../octane/octane-data-provider');

let anomalyGeneralTag = 'Anomaly';
let anomalyTagPrefix = 'Anomaly: ';
let tags = {};

function getUserTags() {
	return new Promise((resolve /*,reject*/) => {
		let tagNames = [anomalyGeneralTag];
		let promises = [octaneDataProvider.verifyUserTag(anomalyGeneralTag)];
		checkersConfig.checkers.forEach(c => {
			tagNames.push(anomalyTagPrefix + c.tag);
			promises.push(octaneDataProvider.verifyUserTag(anomalyTagPrefix + c.tag));
		});
		let i = 0;
		helper.logMessage('Ensuring user tags...');
		Promise.all(promises).then((userTags) => {
			helper.logSuccess('User tags ensured - OK');
			userTags.forEach(userTag => {
				tags[tagNames[i]] = userTag.id;
				i++;
			});
			resolve(tags);
		});
	});
}

module.exports = {
	getUserTags: getUserTags
};
