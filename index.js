'use strict';
const authenticator = require('./data/authenticator');
const checker = require('./checkers/checker');

function run() {
	authenticator.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');
			console.log('Checking for anomalies...');
			checker.check();
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();
