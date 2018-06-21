'use strict';
const helper = require('../helper/helper');
const envConfig = require('../config/environment-config');
const octaneDataProvider = require('./octane-data-provider');
let request = require('request');
if (envConfig.proxy) {
	request = request.defaults({'proxy': envConfig.proxy});
}
const url = require('url');

function authenticate() {
	let uri = url.resolve(envConfig.serverAddress, '/authentication/sign_in');
	let body = {
		client_id: envConfig.clientId,
		client_secret: envConfig.clientSecret
	};
	helper.logMessage('Authenticating...');
	return octaneDataProvider.postData(uri, body);
}

module.exports = {
	authenticate: authenticate
};
