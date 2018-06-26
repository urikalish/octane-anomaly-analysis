'use strict';
const _ = require('lodash');
const settings = require('../config/settings');
const helper = require('../helper/helper');
const octaneDataProvider = require('../octane/octane-data-provider');

const generalAnomalyTag = settings.generalAnomalyTag;
const specificAnomalyTagPrefix = settings.specificAnomalyTagPrefix;
const ignoreAnomalyTag = settings.ignoreAnomalyTag;
let tags = {};

function loadUserTags() {
	return new Promise((resolve /*,reject*/) => {
		let tagNames = [generalAnomalyTag, ignoreAnomalyTag];
		let promises = [octaneDataProvider.verifyUserTag(generalAnomalyTag), octaneDataProvider.verifyUserTag(ignoreAnomalyTag)];
		settings.checkers.forEach(c => {
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

function getIgnoreAnomalyTagName() {
	return ignoreAnomalyTag;
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

function getAllAnomalyTagNames(userTags) {
	let tags = [];
	if (userTags) {
		getTagNames(userTags).forEach(tn => {
			if (tn === generalAnomalyTag || tn.startsWith(specificAnomalyTagPrefix) || tn === ignoreAnomalyTag) {
				tags.push(tn);
			}
		});
	}
	return tags.sort();
}

function hasGeneralAnomalyTag(userTags) {
	let result = false;
	if (userTags) {
		getTagNames(userTags).forEach(tn => {
			if (tn === generalAnomalyTag) {
				result = true;
			}
		});
	}
	return result;
}

function hasIgnoreAnomalyTag(userTags) {
	let result = false;
	if (userTags) {
		getTagNames(userTags).forEach(tn => {
			if (tn === ignoreAnomalyTag) {
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
	getAllAnomalyTagNames: getAllAnomalyTagNames,
	getGeneralAnomalyTagId: getGeneralAnomalyTagId,
	getGeneralAnomalyTagName: getGeneralAnomalyTagName,
	getIgnoreAnomalyTagName: getIgnoreAnomalyTagName,
	hasGeneralAnomalyTag: hasGeneralAnomalyTag,
	hasIgnoreAnomalyTag: hasIgnoreAnomalyTag,
	isAnomalyTagId: isAnomalyTagId,
	getTagIdByName: getTagIdByName
};
