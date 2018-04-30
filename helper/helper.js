'use strict';

function getDefectOwnersStr(d) {
	let owner = d.owner && (d.owner.full_name || d.owner.name);
	let qaOwner = d.qa_owner && (d.qa_owner.full_name || d.qa_owner.name);
	let ownerStr = '<No Owners>';
	if (owner) {
		ownerStr = 'DEV: ' + owner + (qaOwner ? `, QA: ${qaOwner}` : '');
	} else if (qaOwner) {
		ownerStr = 'QA: ' + qaOwner;
	}
	return ownerStr;
}

function getDefectDetailsStr(d) {
	return `${d.severity.name} | ${d.phase.name} | ${getDefectOwnersStr(d)} | #${d.id} | ${d.name}`;
}

module.exports = {
	getDefectDetailsStr: getDefectDetailsStr
};