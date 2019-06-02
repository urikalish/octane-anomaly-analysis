'use strict';
const _ = require('lodash');
const settings = require('../.settings');
const logger = require('../logger/logger');
const octaneDataProvider = require('../octane/octane-data-provider');
const generalAnomalyTag = settings.generalAnomalyTag;
const specificAnomalyTagPrefix = settings.specificAnomalyTagPrefix;
const ignoreAnomalyTag = settings.ignoreAnomalyTag;
let allTags = [];
let anomalyTags = {};

const loadUserTags = async () => {
	try {
		let tagNames = [generalAnomalyTag, ignoreAnomalyTag];
		settings.checkers.forEach(c => {
			tagNames.push(c.tag);
		});
		tagNames.sort();
		let promises = [];
		tagNames.forEach(tn => {
			promises.push(octaneDataProvider.verifyUserTag(tn));
		});
		logger.logMessage('Ensuring anomaly related user tags...');
		let userTags = await Promise.all(promises);
		userTags.forEach(userTag => {
			anomalyTags[userTag.name] = userTag.id;
			logger.logMessage(`#${userTag.id} ${userTag.name}`);
		});
		logger.logSuccess('Anomaly related user tags ensured - OK');
		logger.logMessage('Get all user tags...');
		allTags = await octaneDataProvider.getAllUserTags();
		logger.logMessage('Got all user tags');
	} catch (err) {
		logger.logFuncError('loadUserTags', err);
		throw err;
	}
};

const getGeneralAnomalyTagId = () => {
	return anomalyTags[generalAnomalyTag];
};

const getGeneralAnomalyTagName = () => {
	return generalAnomalyTag;
};

const getIgnoreAnomalyTagId = () => {
	return anomalyTags[ignoreAnomalyTag];
};

const getIgnoreAnomalyTagName = () => {
	return ignoreAnomalyTag;
};

const getTagNames = (userTags) => {
	let tags = [];
	if (userTags['total_count']) {
		if (userTags['total_count'] > 0) {
			userTags.data.forEach(t => {
				if (t.name) {
					tags.push(t.name);
				} else {
					tags.push(getTagNameById(t.id));
				}
			});
		}
	} else {
		tags = userTags;
	}
	return tags.sort();
};

const getAllAnomalyTagNames = (userTags) => {
	let tags = [];
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
	_.forEach(anomalyTags, (id) => {
		if (id === tagId) {
			found = true;
		}
	});
	return found;
};

const getTagIdByName = (tagName) => {
	const tag = _.find(allTags, t => {
		return t.name === tagName;
	});
	return (tag && tag.id) || 0;
};

const getTagNameById = (tagId) => {
	const tag = _.find(allTags, t => {
		return t.id === tagId;
	});
	return (tag && tag.name) || '';
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
