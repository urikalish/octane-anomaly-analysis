'use strict';
const _ = require('lodash');
const octaneDataProvider = require('../octane/octane-data-provider');
const tagsManager = require('../tags/tags-manager');
const helper = require('../helper/helper');
const checkersConfig = require('../config/checks-config');

let defects = {};

// function getDefects() {
// 	return defects;
// }

function ensureDefect(d) {
	if (!defects[d.id]) {
		defects[d.id] = {
			d: d,
			tags: {
				octane: [],
				prev: [],
				cur: []
			},
			anomalies: []
		}
	}
	return defects[d.id];
}

function loadFromOctane() {
	let generalAnomalyTagId = tagsManager.getGeneralAnomalyTagId();
	octaneDataProvider.getTaggedDefects(generalAnomalyTagId).then(taggedDefects => {
		if (taggedDefects && taggedDefects['total_count'] > 0) {
			taggedDefects.data.forEach(d => {
				let defect = ensureDefect(d);
				defect.tags.db = tagsManager.getAllAnomalyTags(d['user_tags']);
			});
		}
	});
}

// function loadFromPrev() {
// }

function checkForAnomalies() {
	helper.logMessage('Retrieving defects...');
	octaneDataProvider.getLastDefects(checkersConfig.defectsTotalDataSetSize).then((lastDefects) => {
		helper.logSuccess('Defects retrieved - OK');
		helper.logMessage('Checking for anomalies...');
		checkersConfig.checkers.forEach(c => {
			if ((_.isUndefined(c.enabled) || c.enabled) && c.entity === 'defect') {
				let checker = require(`../checks/${c.name}`);
				checker.check(lastDefects, c.options);
			}
		});
	});
}

function handleDefects() {
	loadFromOctane();
	//load from previous run
	checkForAnomalies();
}

module.exports = {
	handleDefects: handleDefects,
	//getDefects: getDefects,
	//loadFromOctane: loadFromOctane,
	//loadFromPrev: loadFromPrev,
	//checkForAnomalies: checkForAnomalies
};
