'use strict';
const helper = require('./helper/helper');
const octaneAuthenticator = require('./octane/octane-authenticator');
const checker = require('./checkers/checker');

function run() {
	octaneAuthenticator.authenticate().then(
		(/*result*/) => {
			helper.logSuccess('Authenticated - OK');
			checker.check();
		},
		(reason) => {
			helper.logError('Authentication Error - ' + reason.message);
		}
	);
}

run();
