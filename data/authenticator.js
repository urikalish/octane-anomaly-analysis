'use strict';
const configEnv = require('../config/config-environment');
const dataProvider = require('./data-provider');
let request = require('request');
if (configEnv.proxy) {
	request = request.defaults({'proxy': configEnv.proxy});
}
const url = require('url');
const tough = require('tough-cookie');

function authenticate() {
	let uri = url.resolve(configEnv.server_address, '/authentication/sign_in');
	let body = {
		client_id: configEnv.client_id,
		client_secret: configEnv.client_secret
	};
	console.log('Authenticating...');
	return dataProvider.postData(uri, body);
}

module.exports = {
	authenticate: authenticate
};