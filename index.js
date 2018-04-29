'use strict';
const dataProvider = require('./data/data-provider');
const defectLargeAttachments = require('./checkers/defect-large-attachments');
const defectManyComments = require('./checkers/defect-many-comments');
const defectManyOwners = require('./checkers/defect-many-owners');
const defectStuckPhase = require('./checkers/defect-stuck-phase');
const defectUnusualOwner = require('./checkers/defect-unusual-owner');

function run() {
	dataProvider.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');
			console.log('--------------------------------------------------------------------------------');
			dataProvider.getDefects(100).then(
				(defects) => {
					defectStuckPhase.check(defects);
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
