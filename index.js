'use strict';
const logger = require('./logger/logger');
const octaneAuthenticator = require('./octane/octane-authenticator');
const tagsManager = require('./tags/tags-manager');
const defectsManager = require('./defects/defects-manager');

let run = async () => {
	let startTime = new Date();
	try {
		logger.clearLog();
		await octaneAuthenticator.authenticate();
		logger.logSuccess('Authenticated - OK');
		await tagsManager.loadUserTags();
		await defectsManager.handleDefects();
		logger.logSuccess(`Done - ${Math.round(((new Date()).getTime() - startTime.getTime()) / 1000)} seconds`);
	} catch (err) {
		logger.logError('Error');
	}
};

run();
