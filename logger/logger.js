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
	const msg = `Error on ${functionName}() ${(err.message || err)}`;
	console.log(chalk.redBright(msg));
	log.push(msg);
};

const logAnomaly = (msg) => {
	console.log(chalk.cyanBright(msg));
	log.push(msg);
};

module.exports = {
	//getLog,
	clearLog,
	logMessage,
	logSuccess,
	logWarning,
	logError,
	logFuncError,
	logAnomaly,
};
