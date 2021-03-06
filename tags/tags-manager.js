'use strict';
const _ = require('lodash');
const settings = require('../.settings');
const logger = require('../logger/logger');
const octaneDataProvider = require('../octane/octane-data-provider');
const generalAnomalyTag = settings.generalAnomalyTag;
const specificAnomalyTagPrefix = settings.specificAnomalyTagPrefix;
const ignoreAnomalyTag = settings.ignoreAnomalyTag;
let tags = {};

const loadUserTags = async () => {
	try {
		const tagNames = [generalAnomalyTag, ignoreAnomalyTag];
		settings.checkers.forEach(c => {
			tagNames.push(c.tag);
		});
		tagNames.sort();
		const promises = [];
		tagNames.forEach(tn => {
			promises.push(octaneDataProvider.verifyUserTag(tn));
		});
		logger.logMessage('Ensuring anomaly related user tags...');
		const userTags = await Promise.all(promises);
		userTags.forEach(userTag => {
			tags[userTag.name] = userTag.id;
			logger.logMessage(`#${userTag.id} ${userTag.name}`);
		});
		logger.logSuccess('Anomaly related user tags ensured - OK');
		return tags;
	} catch (err) {
		logger.logFuncError('loadUserTags', err);
		return err;
	}
};

const getGeneralAnomalyTagId = () => {
	return tags[generalAnomalyTag];
};

const getGeneralAnomalyTagName = () => {
	return generalAnomalyTag;
};

const getIgnoreAnomalyTagId = () => {
	return tags[ignoreAnomalyTag];
};

const getIgnoreAnomalyTagName = () => {
	return ignoreAnomalyTag;
};

const getTagNames = (userTags) => {
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
};

const getAllAnomalyTagNames = (userTags) => {
	const tags = [];
	if (userTags) {
		getTagNames(userTags).forEach(tn => {
			if (tn === generalAnomalyTag || tn.startsWith(specificAnomalyTagPrefix) || tn === ignoreAnomalyTag) {
				tags.push(tn);
			}
		});
	}
	return tags.sort();
};

const hasGeneralAnomalyTag = (userTags) => {
	let result = false;
	if (userTags) {
		getTagNames(userTags).forEach(tn => {
			if (tn === generalAnomalyTag) {
				result = true;
			}
		});
	}
	return result;
};

const hasIgnoreAnomalyTag = (userTags) => {
	let result = false;
	if (userTags) {
		getTagNames(userTags).forEach(tn => {
			if (tn === ignoreAnomalyTag) {
				result = true;
			}
		});
	}
	return result;
};

const isAnomalyTagId = (tagId) => {
	let found = false;
	_.forEach(tags, (id) => {
		if (id === tagId) {
			found = true;
		}
	});
	return found;
};

const getTagIdByName = (tagName) => {
	return tags[tagName];
};

module.exports = {
	loadUserTags,
	getAllAnomalyTagNames,
	getGeneralAnomalyTagId,
	getGeneralAnomalyTagName,
	getIgnoreAnomalyTagId,
	getIgnoreAnomalyTagName,
	hasGeneralAnomalyTag,
	hasIgnoreAnomalyTag,
	isAnomalyTagId,
	getTagIdByName,
};
