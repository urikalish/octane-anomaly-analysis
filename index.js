'use strict';
const apiService = require('./api-service');
const dataProvider = require('./data-provider');
const defectUnusualOwner = require('./checkers/defect-unusual-owner');
const defectCommentsNumber = require('./checkers/defect-comments-number');
const defectManyOwners = require('./checkers/defect-many-owners');

function run() {
	apiService.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');
			console.log('--------------------------------------------------------------------------------');
			dataProvider.getDefects(100).then(
				(data) => {
					defectUnusualOwner.check(data);
					defectCommentsNumber.check(data);
					defectManyOwners.check(data);
				});
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();
