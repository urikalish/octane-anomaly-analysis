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
	return `#${d.id} | ${d.severity.name} | ${d.phase.name} | ${d.team.name} | ${getDefectOwnersStr(d)} | ${d.name}`;
}

function getSeverityOrder(severity) {
	let order = {
		'list_node.severity.urgent': 1,
		'list_node.severity.very_high': 2,
		'list_node.severity.high': 3,
		'list_node.severity.medium': 4,
		'list_node.severity.low': 5,
		'_DEFAULT': 6,
	};
	return order[severity.logical_name] || order['_DEFAULT'];
}

function compareDefects(a, b) {
	if (a.severity.logical_name === b.severity.logical_name) {
		if (a.phase.name === b.phase.name) {
			return 0;
		}
		return a.phase.name < b.phase.name ? -1 : 1;
	}
	return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
}

module.exports = {
	getDefectDetailsStr: getDefectDetailsStr,
	compareDefects: compareDefects
};
