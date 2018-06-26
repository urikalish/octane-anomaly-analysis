'use strict';
const helper = require('./helper/helper');
const octaneAuthenticator = require('./octane/octane-authenticator');
const tagsManager = require('./tags/tags-manager');
const defectsManager = require('./defects/defects-manager');

function run() {
	helper.clearLog();
	octaneAuthenticator.authenticate().then(
		(/*result*/) => {
			helper.logSuccess('Authenticated - OK');
			tagsManager.loadUserTags().then((/*userTags*/) => {
				defectsManager.handleDefects();
			});
		},
		(reason) => {
			helper.logError('Authentication Error - ' + reason.message);
		}
	);
}

run();
