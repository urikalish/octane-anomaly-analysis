'use strict';
let environment = {
	//serverAddress: 'https://alm-octane.saas.acme.com',
	serverAddress: process.env.SERVER_ADDRESS,

	//domainName: 'http://saas.acme.com',
	domainName: process.env.SERVER_DOMAIN,

	//sharedspaceId: '1001',
	sharedspaceId: process.env.SHAREDSPACE_ID,

	//workspaceId: '1002',
	workspaceId: process.env.WORKSPACE_ID,

	/* Use an empty string if no proxy */
	//proxy: 'http://42.42.42.42:8080',
	proxy: process.env.PROXY,

	clientId: process.env.CLIENT_ID,

	clientSecret: process.env.CLIENT_SECRET,
};

module.exports = environment;
