'use strict';
const chalk = require('chalk');

let log = [];

function getDefectOwnersStr(d) {
	let owner = d.owner && (d.owner.full_name || d.owner.name);
	let qaOwner = d.qa_owner && (d.qa_owner.full_name || d.qa_owner.name);
	let ownerStr = '<No Owner>';
	if (owner) {
		ownerStr = 'DEV: ' + owner + (qaOwner ? `, QA: ${qaOwner}` : '');
	} else if (qaOwner) {
		ownerStr = 'QA: ' + qaOwner;
	}
	return ownerStr;
}

function getDefectDetailsStr(d) {
	if (!d.severity) {
		console.log('############' + d.id);
	}
	return `${d.severity ? d.severity.name : '<No Severity>'} | ${d.phase ? d.phase.name : '<No Phase>'} | ${d.team ? d.team.name : '<No Team>'} | ${getDefectOwnersStr(d)} | #${d.id || '<No ID>'} | ${d.name || '<No Name>'}`;
}

// function getSeverityOrder(severity) {
// 	let order = {
// 		'list_node.severity.urgent': 1,
// 		'list_node.severity.very_high': 2,
// 		'list_node.severity.high': 3,
// 		'list_node.severity.medium': 4,
// 		'list_node.severity.low': 5,
// 		'_DEFAULT': 6,
// 	};
// 	return order[severity.logical_name] || order['_DEFAULT'];
// }

// function compareDefects(a, b) {
// 	if (a.severity.logical_name === b.severity.logical_name) {
// 		if (a.phase.name === b.phase.name) {
// 			return 0;
// 		}
// 		return a.phase.name < b.phase.name ? -1 : 1;
// 	}
// 	return getSeverityOrder(a.severity) - getSeverityOrder(b.severity);
// }

function clearLog() {
	log = [];
}

// function getLog() {
// 	return log;
// }

function logMessage(msg) {
	console.log(chalk.magentaBright(msg));
	log.push(msg);
}

function logSuccess(msg) {
	console.log(chalk.greenBright(msg));
	log.push(msg);
}

function logError(msg) {
	console.log(chalk.redBright(msg));
	log.push(msg);
}

function logAnomaly(msg) {
	console.log(chalk.cyanBright(msg));
	log.push(msg);
}

module.exports = {
	clearLog: clearLog,
	//getLog: getLog,
	logMessage: logMessage,
	logSuccess: logSuccess,
	logError: logError,
	logAnomaly: logAnomaly,
	getDefectDetailsStr: getDefectDetailsStr,
	//compareDefects: compareDefects
};
