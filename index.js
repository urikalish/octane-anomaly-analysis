'use strict';
const helper = require('./helper/helper');
const authenticator = require('./data/authenticator');
const checker = require('./checkers/checker');

function run() {
	authenticator.authenticate().then(
		(/*result*/) => {
			helper.logSuccess('Authenticated - OK');
			helper.logMessage('Checking for anomalies...');
			checker.check();
		},
		(reason) => {
			helper.logError('Authenticated Error - ' + reason);
		}
	);
}

run();
