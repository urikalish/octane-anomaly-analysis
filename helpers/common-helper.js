'use strict';

const initCheckerResult = (checkerName) => {
	return {
		checkerName: checkerName,
		anomalies: {}
	}
};

const addAnomaly = (checkerResult, e, text) => {
	checkerResult.anomalies[e.id] = {
		e: e,
		checkerName: checkerResult.checkerName,
		text: text
	};
};

const getEntityOwnersStr = (e) => {
	const owner = e.owner && (e.owner.full_name || e.owner.name);
	const qaOwner = e.qa_owner && (e.qa_owner.full_name || e.qa_owner.name);
	let ownerStr = '<No Owner>';
	if (owner) {
		ownerStr = 'DEV: ' + owner + (qaOwner ? `, QA: ${qaOwner}` : '');
	} else if (qaOwner) {
		ownerStr = 'QA: ' + qaOwner;
	}
	return ownerStr;
};

module.exports = {
	initCheckerResult,
	addAnomaly,
	getEntityOwnersStr
};
