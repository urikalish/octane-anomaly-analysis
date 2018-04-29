'use strict';
const dataProvider = require('../data/data-provider');
const defectLargeAttachments = require('./defect-large-attachments');
const defectManyComments = require('./defect-many-comments');
const defectManyOwners = require('./defect-many-owners');
const defectStuckPhase = require('./defect-stuck-phase');
const defectUnusualOwner = require('./defect-unusual-owner');

function check() {
	dataProvider.getDefects(100).then(
	(defects) => {
		defectStuckPhase.check(defects);
		defectUnusualOwner.check(defects);
		defectManyOwners.check(defects);
		defectManyComments.check(defects);
		defectLargeAttachments.check(defects);
	});
}

module.exports = {
	check: check
};
