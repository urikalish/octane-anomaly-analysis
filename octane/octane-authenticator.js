'use strict';
const logger = require('../logger/logger');
const octaneDataProvider = require('./octane-data-provider');
let request = require('request');
if (process.env.PROXY) {
	request = request.defaults({'proxy': process.env.PROXY});
}
const url = require('url');

const authenticate = async () => {
	let uri = url.resolve(process.env.SERVER_ADDRESS, '/authentication/sign_in');
	let body = {
		client_id: process.env.CLIENT_ID,
		client_secret: process.env.CLIENT_SECRET
	};
	logger.logMessage('Authenticating...');
	return await octaneDataProvider.postToOctane(uri, body);
};

module.exports = {
	authenticate: authenticate
};
