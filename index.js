'use strict';
require('dotenv').config();
const logger = require('./logger/logger');
const octaneAuthenticator = require('./octane/octane-authenticator');
const tagsManager = require('./tags/tags-manager');
const defectsManager = require('./defects/defects-manager');
const MAX_TRY_COUNT = 3;
const WAIT_SECS_BETWEEN_TRIES = 5;
let tryCount = 0;

const run = async () => {
	tryCount++;
	logger.logMessage(`Try number ${tryCount}`);
	try {
		await octaneAuthenticator.authenticate();
		logger.logSuccess('Authenticated - OK');
		await tagsManager.loadUserTags();
		const startTime = new Date();
		await defectsManager.handleDefects();
		logger.logSuccess(`Done - ${Math.round(((new Date()).getTime() - startTime.getTime()) / 1000)} seconds`);
	} catch (err) {
		logger.logError('Error');
		if (tryCount < MAX_TRY_COUNT) {
			logger.logMessage(`Waiting for ${WAIT_SECS_BETWEEN_TRIES} seconds before trying again...`);
			setTimeout(() => {
				run();
			}, WAIT_SECS_BETWEEN_TRIES*1000);
		} else {
			logger.logError(`Quit`);
		}
	}
};

logger.clearLog();
if (process.env.SERVER_ADDRESS && process.env.SERVER_DOMAIN /* && process.env.PROXY*/ && process.env.SHAREDSPACE_ID && process.env.WORKSPACE_ID && process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
	run();
} else {
	logger.logError('ERROR - Environment not configured');
}

