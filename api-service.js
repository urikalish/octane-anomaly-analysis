'use strict';
let request = require('request');
const config = require('./config');
if (config.proxy) {
	//'http://16.46.16.11:8080'
	request = request.defaults({'proxy': config.proxy});
}
const url = require('url');
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar(undefined, {rejectPublicSuffixes: false});

function authenticate() {
	let uri = url.resolve(config.server_address, '/authentication/sign_in');
	let body = {
		client_id: config.client_id,
		client_secret: config.client_secret
	};
	console.log('Authenticating...');
	return postData(uri, body);
}

function getEntity(uri) {
	return new Promise((resolve, reject) => {
		request({
			method: 'GET',
			url: uri,
			headers: getHeaders()
		},
		function (err, response, body) {
			if (err) {
				return reject(err);
			}

			if (response.statusCode < 200 || response.statusCode > 299) {
				return reject({
					statusCode: response.statusCode,
					message: JSON.parse(response.body).description,
					description: JSON.parse(response.body)
				});
			}

			try {
				resolve(JSON.parse(body));
			} catch (e) {
				resolve(body);
			}
		});
	});
}

function postData(uri, body, formData) {
	return new Promise((resolve, reject) => {
		let options = {
			method: 'POST',
			url: uri,
			headers: getHeaders()
		};

		if (formData) {
			options.formData = formData;
		}
		if (body) {
			options.body = JSON.stringify(body);
		}

		request(options, (err, response, body) => {
			if (err) {
				return reject(err);
			}

			console.log(response);

			if (response.statusCode < 200 || response.statusCode > 299) {
				return reject({
					statusCode: response.statusCode,
					message: JSON.parse(response.body).description,
					description: JSON.parse(response.body)
				});
			}

			if (response.headers['set-cookie']) {
				response.headers['set-cookie'].forEach((cookie) => {
					cookieJar.setCookie(Cookie.parse(cookie), config.domain_name, {}, (error) => {
						if (error) {
							console.log(error);
							return reject(error);
						}
					});
				});
			}

			try {
				resolve({response: response, body: JSON.parse(body)});
			} catch (e) {
				resolve(body);
			}
		});
	});
}

function getHeaders() {
	let headers = {
		"Content-Type": "application/json",
		"HPECLIENTTYPE": "HPE_REST_API_TECH_PREVIEW"
	};
	cookieJar.getCookieString(config.domain_name, {allPaths: true}, function (err, cookies) {
		if (cookies) {
			headers['Cookie'] = cookies;
		}
	});

	return headers;
}


module.exports = {
	authenticate: authenticate,
	getEntity: getEntity,
	postData: postData
};
