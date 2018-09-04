'use strict';
const logger = require('./logger/logger');
const octaneAuthenticator = require('./octane/octane-authenticator');
const tagsManager = require('./tags/tags-manager');
const defectsManager = require('./defects/defects-manager');

function run() {
	let startTime = new Date();
	logger.clearLog();
	octaneAuthenticator.authenticate().then(
		(/*result*/) => {
			logger.logSuccess('Authenticated - OK');
			tagsManager.loadUserTags().then((/*userTags*/) => {
				defectsManager.handleDefects().then(
				(/*result*/) => {
					logger.logSuccess(`Done - ${Math.round(((new Date()).getTime() - startTime.getTime()) / 1000)} seconds`);
				},
				(/*err*/) => {
					logger.logError('Error');
				});
			});
		},
		(err) => {
			logger.logError('Authentication Error - ' + err.message);
		}
	);
}

run();
