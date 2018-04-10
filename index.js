'use strict';
const apiService = require('./api-service');
const dataProvider = require('./data-provider');
const defectUnusualOwner = require('./checkers/defect-unusual-owner');
const defectManyComments = require('./checkers/defect-many-comments');
const defectManyOwners = require('./checkers/defect-many-owners');

function run() {
	apiService.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');
			console.log('--------------------------------------------------------------------------------');
			dataProvider.getDefects(3000).then(
				(data) => {
					defectManyComments.check(data);
					defectUnusualOwner.check(data);
					defectManyOwners.check(data);
				});
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();
