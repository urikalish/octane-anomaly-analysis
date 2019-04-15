'use strict';
const chalk = require('chalk');
let log = [];

const clearLog = () => {
	log = [];
};

// const getLog = () => {
// 	return log;
// };

const logMessage = (msg) => {
	console.log(chalk.magentaBright(msg));
	log.push(msg);
};

const logSuccess = (msg) => {
	console.log(chalk.greenBright(msg));
	log.push(msg);
};

const logWarning = (msg) => {
	console.log(chalk.yellowBright(msg));
	log.push(msg);
};

const logError = (msg) => {
	console.log(chalk.redBright(msg));
	log.push(msg);
};

const logFuncError = (functionName, err) => {
	let msg = `Error on ${functionName}() ${(err.message || err)}`;
	console.log(chalk.redBright(msg));
	log.push(msg);
};

const logAnomaly = (msg) => {
	console.log(chalk.cyanBright(msg));
	log.push(msg);
};

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
