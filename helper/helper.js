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
	return `#${d.id} | ${d.severity.name} | ${d.phase.name} | ${getDefectOwnersStr(d)} | ${d.name}`;
}

function compareDefects(a, b) {
	if (a.severity.name === b.severity.name) {
		if (a.phase.name === b.phase.name) {
			return 0;
		}
		return a.phase.name < b.phase.name ? -1 : 1;
	}
	return a.severity.name < b.severity.name ? -1 : 1;
}

module.exports = {
	getDefectDetailsStr: getDefectDetailsStr,
	compareDefects: compareDefects
};