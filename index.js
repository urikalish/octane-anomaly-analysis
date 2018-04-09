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
			let defectsLimit = 100;

			dataProvider.getDefects(defectsLimit).then(
				(result) => {
					//console.log(result.data[0]);
					defectUnusualOwner.check(result.data);
					defectCommentsNumber.check(result.data);
					defectManyOwners.check(result.data);
				}
			);
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();
