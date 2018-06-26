'use strict';
const checkersConfig = require('../config/checks-config');
const helper = require('../helper/helper');
const octaneDataProvider = require('../octane/octane-data-provider');

let generalAnomalyTag = 'Anomaly';
let specificAnomalyTagPrefix = 'Anomaly: ';
let ignoreAnomalyTag = 'Ignore Anomaly';
let tags = {};

function loadUserTags() {
	return new Promise((resolve /*,reject*/) => {
		let tagNames = [generalAnomalyTag];
		let promises = [octaneDataProvider.verifyUserTag(generalAnomalyTag)];
		checkersConfig.checkers.forEach(c => {
			tagNames.push(c.tag);
			promises.push(octaneDataProvider.verifyUserTag(c.tag));
		});
		helper.logMessage('Ensuring user tags...');
		Promise.all(promises).then((userTags) => {
			helper.logSuccess('User tags ensured - OK');
			userTags.forEach(userTag => {
				tags[userTag.name] = userTag.id;
			});
			resolve(tags);
		},
		(err) => {
			helper.logError('Error on loadUserTags() - ' + (err.message || err));
		});
	});
}

function getGeneralAnomalyTagId() {
	return tags[generalAnomalyTag];
}

function getGeneralAnomalyTagName() {
	return generalAnomalyTag;
}

function getTagNames(userTags) {
	let tags = [];
	if (userTags['total_count']) {
		if (userTags['total_count'] > 0) {
			userTags.data.forEach(t => {
				tags.push(t.name);
			});
		}
	} else {
		tags = userTags;
	}
	return tags.sort();
}

function getAllAnomalyTags(userTags) {
	let tags = [];
	if (userTags) {
		getTagNames(userTags).forEach(t => {
			if (t === generalAnomalyTag || t.startsWith(specificAnomalyTagPrefix) || t === ignoreAnomalyTag) {
				tags.push(t.name);
			}
		});
	}
	return tags.sort();
}

function hasGeneralAnomalyTag(userTags) {
	let result = false;
	if (userTags) {
		getTagNames(userTags).forEach(t => {
			if (t.name === generalAnomalyTag) {
				result = true;
			}
		});
	}
	return result;
}

function hasIgnoreAnomalyTag(userTags) {
	let result = false;
	if (userTags) {
		getTagNames(userTags).forEach(t => {
			if (t.name === ignoreAnomalyTag) {
				result = true;
			}
		});
	}
	return result;
}

function isAnomalyTagId(tagId) {
	let found = false;
	_.forEach(tags, (id) => {
		if (id === tagId) {
			found = true;
		}
	});
	return found;
}

function getTagIdByName(tagName) {
	return tags[tagName];
}

module.exports = {
	loadUserTags: loadUserTags,
	getAllAnomalyTags: getAllAnomalyTags,
	getGeneralAnomalyTagId: getGeneralAnomalyTagId,
	getGeneralAnomalyTagName: getGeneralAnomalyTagName,
	hasGeneralAnomalyTag: hasGeneralAnomalyTag,
	hasIgnoreAnomalyTag: hasIgnoreAnomalyTag,
	isAnomalyTagId: isAnomalyTagId,
	getTagIdByName: getTagIdByName
};
