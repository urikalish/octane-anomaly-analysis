let config = {
	server_address: process.env.SERVER_ADDRESS,
	domain_name: process.env.SERVER_DOMAIN,
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	sharedspace_id: process.env.SHAREDSPACE_ID,
	workspace_id: process.env.WORKSPACE_ID,
	proxy: process.env.PROXY,
	api_url: process.env.SERVER_ADDRESS + '/api/shared_spaces/' + process.env.SHAREDSPACE_ID + '/workspaces/' + process.env.WORKSPACE_ID
};

module.exports = config;
