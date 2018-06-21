'use strict';
const checkersConfig = require('../config/checks-config');
const helper = require('../helper/helper');
const octaneDataProvider = require('../octane/octane-data-provider');

let generalAnomalyTag = 'Anomaly';
let specificAnomalyTagPrefix = 'Anomaly: ';
let tags = {};

function loadUserTags() {
	return new Promise((resolve /*,reject*/) => {
		let tagNames = [generalAnomalyTag];
		let promises = [octaneDataProvider.verifyUserTag(generalAnomalyTag)];
		checkersConfig.checkers.forEach(c => {
			tagNames.push(specificAnomalyTagPrefix + c.tag);
			promises.push(octaneDataProvider.verifyUserTag(specificAnomalyTagPrefix + c.tag));
		});
		helper.logMessage('Ensuring user tags...');
		Promise.all(promises).then((userTags) => {
			helper.logSuccess('User tags ensured - OK');
			userTags.forEach(userTag => {
				tags[userTag.name] = userTag.id;
			});
			resolve(tags);
		});
	});
}

function getGeneralAnomalyTagId() {
	return tags[generalAnomalyTag];
}

function getAllAnomalyTags(userTags) {
	let tags = [];
	if (userTags && userTags['total_count'] && userTags['total_count'] > 0) {
		userTags.data.forEach(t => {
			if (t.name === generalAnomalyTag || t.name.startsWith(specificAnomalyTagPrefix)) {
				tags.push(t.name);
			}
		});
	}
	return tags;
}

// function getSpecificAnomalyTags(userTags) {
// 	let tags = [];
// 	if (userTags && userTags['total_count'] && userTags['total_count'] > 0) {
// 		userTags.data.forEach(t => {
// 			if (t.name.startsWith(specificAnomalyTagPrefix)) {
// 				tags.push(t.name);
// 			}
// 		});
// 	}
// 	return tags;
// }

// function hasGeneralAnomalyTag(userTags) {
// 	let result = false;
// 	if (userTags && userTags['total_count'] && userTags['total_count'] > 0) {
// 		userTags.data.forEach(t => {
// 			if (t.name === generalAnomalyTag) {
// 				result = true;
// 			}
// 		});
// 	}
// 	return result;
// }

module.exports = {
	loadUserTags: loadUserTags,
	getGeneralAnomalyTagId: getGeneralAnomalyTagId,
	//hasGeneralAnomalyTag: hasGeneralAnomalyTag,
	getAllAnomalyTags: getAllAnomalyTags,
	//getSpecificAnomalyTags: getSpecificAnomalyTags
};
