'use strict';
const envConfig = require('../config/environment-config');
const dataProvider = require('./data-provider');
let request = require('request');
if (envConfig.proxy) {
	request = request.defaults({'proxy': envConfig.proxy});
}
const url = require('url');

function authenticate() {
	let uri = url.resolve(envConfig.server_address, '/authentication/sign_in');
	let body = {
		client_id: envConfig.client_id,
		client_secret: envConfig.client_secret
	};
	console.log('Authenticating...');
	return dataProvider.postData(uri, body);
}

module.exports = {
	authenticate: authenticate
};