'use strict';
const environment = require('../config/environment');
const helper = require('../helper/helper');
const octaneDataProvider = require('./octane-data-provider');
let request = require('request');
if (environment.proxy) {
	request = request.defaults({'proxy': environment.proxy});
}
const url = require('url');

function authenticate() {
	let uri = url.resolve(environment.serverAddress, '/authentication/sign_in');
	let body = {
		client_id: environment.clientId,
		client_secret: environment.clientSecret
	};
	helper.logMessage('Authenticating...');
	return octaneDataProvider.postToOctane(uri, body);
}

module.exports = {
	authenticate: authenticate
};
