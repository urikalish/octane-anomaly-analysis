'use strict';
const logger = require('./logger/logger');
const octaneAuthenticator = require('./octane/octane-authenticator');
const tagsManager = require('./tags/tags-manager');
const defectsManager = require('./defects/defects-manager');

function run() {
	logger.clearLog();
	octaneAuthenticator.authenticate().then(
		(/*result*/) => {
			logger.logSuccess('Authenticated - OK');
			tagsManager.loadUserTags().then((/*userTags*/) => {
				defectsManager.handleDefects();
			});
		},
		(reason) => {
			logger.logError('Authentication Error - ' + reason.message);
		}
	);
}

run();
