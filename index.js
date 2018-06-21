'use strict';
const helper = require('./helper/helper');
const octaneAuthenticator = require('./octane/octane-authenticator');
const tagsManager = require('./tags/tags-manager');
const checker = require('./checkers/checker');

function run() {
	octaneAuthenticator.authenticate().then(
		(/*result*/) => {
			helper.logSuccess('Authenticated - OK');

			tagsManager.loadAndEnsureTags().then((/*tags*/) => {
				checker.check();
			});
		},
		(reason) => {
			helper.logError('Authentication Error - ' + reason.message);
		}
	);
}

run();
