'use strict';
const envConfig = require('../config/environment-config');
const dataProvider = require('./data-provider');
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
	console.log('Authenticating...');
	return dataProvider.postData(uri, body);
}

module.exports = {
	authenticate: authenticate
};