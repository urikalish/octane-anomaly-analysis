'use strict';
const apiService = require('./api-service');
const dataProvider = require('./data-provider');
const defectLargeAttachments = require('./checkers/defect-large-attachments');
const defectManyComments = require('./checkers/defect-many-comments');
const defectManyOwners = require('./checkers/defect-many-owners');
const defectUnusualOwner = require('./checkers/defect-unusual-owner');

function run() {
	apiService.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');
			console.log('--------------------------------------------------------------------------------');
			dataProvider.getDefects(3000).then(
				(defects) => {
					defectUnusualOwner.check(defects);
					defectManyOwners.check(defects);
					defectManyComments.check(defects);
					defectLargeAttachments.check(defects);
				});
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();
