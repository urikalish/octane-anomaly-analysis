'use strict';
const chalk = require('chalk');

let log = [];

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

function logWarning(msg) {
	console.log(chalk.yellowBright(msg));
	log.push(msg);
}

function logError(msg) {
	console.log(chalk.redBright(msg));
	log.push(msg);
}

function logFuncError(functionName, err) {
	let msg = `Error on ${functionName}() ${(err.message || err)}`;
	console.log(chalk.redBright(msg));
	log.push(msg);
}

function logAnomaly(msg) {
	console.log(chalk.cyanBright(msg));
	log.push(msg);
}

module.exports = {
	//getLog: getLog,
	clearLog: clearLog,
	logMessage: logMessage,
	logSuccess: logSuccess,
	logWarning: logWarning,
	logError: logError,
	logFuncError: logFuncError,
	logAnomaly: logAnomaly
};
