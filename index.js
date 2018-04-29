'use strict';
const authenticator = require('./data/authenticator');
const dataProvider = require('./data/data-provider');
const checker = require('./checkers/checker');

function run() {
	authenticator.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');
			dataProvider.getDefects(100).then(
				(defects) => {
					checker.check(defects);
				});
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();
