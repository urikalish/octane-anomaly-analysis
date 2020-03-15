'use strict';
const logger = require('../logger/logger');
const apiUrl = `${process.env.SERVER_ADDRESS}/api/shared_spaces/${process.env.SHAREDSPACE_ID}/workspaces/${process.env.WORKSPACE_ID}`;
let request = require('request');
if (process.env.PROXY) {
	request = request.defaults({'proxy': process.env.PROXY});
}
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar(undefined, {rejectPublicSuffixes: false});

let loadedCount = 0;
let loadedPercent = 0;

const getFromOctane = (uri) => {
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
				logger.logError(response.statusCode + ' ' + response.statusMessage);
				return reject({
					statusCode: response.statusCode,
					message: response.statusMessage,
					description: response.statusMessage
				});
			}

			try {
				resolve(JSON.parse(body));
			} catch (e) {
				resolve(body);
			}
		});
	});
};

const postToOctane = (uri, body) => {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'POST',
			url: uri,
			headers: getHeaders()
		};
		if (body) {
			options.body = JSON.stringify(body);
		}
		request(options, (err, response, body) => {
			if (err) {
				return reject(err);
			}
			if (response.statusCode < 200 || response.statusCode > 299) {
				logger.logError('Error on postToOctane() ' + response.statusCode + ' ' + response.statusMessage);
				return reject({
					statusCode: response.statusCode,
					message: response.statusMessage,
					description: response.statusMessage
					//message: JSON.parse(response.body).description,
					//description: JSON.parse(response.body)
				});
			}
			if (response.headers['set-cookie']) {
				response.headers['set-cookie'].forEach((cookie) => {
					cookieJar.setCookie(Cookie.parse(cookie), process.env.SERVER_DOMAIN, {}, (error) => {
						if (error) {
							logger.logError(error);
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
};

const putMultipleToOctane = (uri, body) => {
	return new Promise((resolve /*, reject*/) => {
		const options = {
			method: 'PUT',
			url: uri,
			headers: getHeaders()
		};
		if (body) {
			options.body = JSON.stringify(body);
		}
		request(options, (err, response, body) => {
			if (err) {
				logger.logError(`Error on putMultipleToOctane() - ${err.message || err}`);
				return resolve(0);
			}
			try {
				let res = JSON.parse(body);
				if (res['total_count'] && !res['errors']) {
					logger.logMessage(`${res['total_count']} entities successfully updated`);
				} else {
					if (!res['total_count'] || res['total_count'] === 0) {
						logger.logWarning(`Nothing was updated`);
					} else {
						logger.logWarning(`Partial update (${res['total_count']}/${res['total_count'] + res['errors'].length})`);
					}
					if (res['errors']) {
						res['errors'].forEach(e => {
							logger.logError(`defect #${e['properties']['entity_id']} - ${e['description'].replace(/\r?\n|\r/g,' ')}`);
						});
						resolve(res['total_count']);
					} else if (res['description_translated'] || res['description']) {
						logger.logError(`${(res['description_translated'] || res['description']).replace(/\r?\n|\r/g,' ')}`);
						resolve(0);
					}
				}
				resolve(res['total_count']);
			} catch (err) {
				logger.logError(`Error on putMultipleToOctane() - ${err.message || err}`);
				logger.logError(body);
				resolve(0);
			}
		});
	});
};

const getDefectsUri = (isAsc, offset, limit, querySuffix, fields) => {
	return apiUrl +
	`/work_items` +
	`?order_by=${isAsc ? '' : '-'}id` +
	`&offset=${offset || 0}` +
	`&limit=${limit || 1}` +
	`&query="((subtype='defect')${(querySuffix ? ';' + querySuffix : '')})"` +
	`&fields=${fields || 'id,subtype,name,severity,team,owner,qa_owner,phase,creation_time,time_in_current_phase,defect_type,comments,attachments,user_tags'}`;
};

const getStoriesUri = (isAsc, offset, limit, querySuffix, fields) => {
	return apiUrl +
	`/work_items` +
	`?order_by=${isAsc ? '' : '-'}id` +
	`&offset=${offset || 0}` +
	`&limit=${limit || 1}` +
	`&query="((subtype='story')${(querySuffix ? ';' + querySuffix : '')})"` +
	`&fields=${fields || 'id,subtype,name,team,owner,qa_owner,phase,creation_time,time_in_current_phase,comments,attachments,user_tags'}`;
};

const getQualityStoriesUri = (isAsc, offset, limit, querySuffix, fields) => {
	return apiUrl +
	`/work_items` +
	`?order_by=${isAsc ? '' : '-'}id` +
	`&offset=${offset || 0}` +
	`&limit=${limit || 1}` +
	`&query="((subtype='quality_story')${(querySuffix ? ';' + querySuffix : '')})"` +
	`&fields=${fields || 'id,subtype,name,team,owner,qa_owner,phase,creation_time,time_in_current_phase,comments,attachments,user_tags'}`;
};

const getEntityUri = (isAsc, offset, limit, querySuffix, fields, subtype) => {
	let uri = '';
	switch (subtype) {
		case 'defect': {
			uri = getDefectsUri(isAsc, offset, limit, querySuffix, fields);
			break;
		}
		case 'story': {
			uri = getStoriesUri(isAsc, offset, limit, querySuffix, fields);
			break;
		}
		case 'quality_story': {
			uri = getQualityStoriesUri(isAsc, offset, limit, querySuffix, fields);
			break;
		}
	}
	return uri;
};

const getTotalNumberOfEntities = async (subtype) => {
	try {
		let uri = getEntityUri(false, 0, 1, '', '', subtype);
		const result = await getFromOctane(uri);
		return result['total_count'];
	} catch(err) {
		logger.logFuncError('getTotalNumberOfEntities', err);
		throw err;
	}
};

const getEntitiesBatch = async (offset, limit, total, subtype) => {
	try {
		let uri = getEntityUri(false, offset, limit, '', '', subtype);
		const result = await getFromOctane(uri);
		loadedCount += limit;
		const per = Math.round(100.0 * loadedCount / total);
		if (per !== loadedPercent) {
			loadedPercent = per;
			logger.logMessage(`Retrieving entities... ${loadedPercent}%`);
		}
		return result;
	} catch(err) {
		logger.logFuncError('getEntitiesBatch', err);
		throw err;
	}
};

const getLastEntities = async (needed, subtype) => {
	try {
		let offset = 0;
		const batch = 500;
		const promises = [];
		while (needed > offset) {
			const limit = ((needed - offset) >  batch) ? batch : needed - offset;
			promises.push(getEntitiesBatch(offset, limit, needed, subtype));
			offset += batch;
		}
		loadedCount = 0;
		const batchResults = await Promise.all(promises);
		const data = [];
		batchResults.forEach(batchResult => {
			if (batchResult.data) {
				batchResult.data.forEach(batch => {
					data.push(batch);
				});
				data.sort((a, b) => {
					return b.id - a.id;
				});
			}
		});
		return data;
	} catch(err) {
		throw err;
	}
};

const verifyUserTag = async (tagName) => {
	let url = apiUrl +	`/user_tags?query="(((name='${tagName}')))"&fields=id,name`;
	const results = await getFromOctane(url);
	if (results && results['total_count'] !== 0) {
		logger.logMessage('User tag "' + tagName + '" exists with id ' + results.data[0].id);
		return results.data[0];
	} else {
		logger.logMessage('Creating user tag "' + tagName + '"...');
		url = apiUrl + '/user_tags';
		const body = {
			data: [{name: tagName}]
		};
		const result = await postToOctane(url, body);
		logger.logMessage('User tag "' + tagName + '" created with id ' + result.body.data[0].id);
		return result.body.data[0];
	}
};

const getTaggedEntities = async (tagId1, tagId2, subtype) => {
	try {
		let uri = getEntityUri(false, 0, 1000, `(user_tags={id IN '${tagId1}', '${tagId2}'})`, '', subtype);
		return await getFromOctane(uri);
	} catch(err) {
		logger.logFuncError('getTaggedEntities', err);
		throw err;
	}
};

const updateMultipleEntitiesUserTags = (body) => {
	const url =  `${apiUrl}/work_items/`;
	return putMultipleToOctane(url, body);
};

const getHeaders = () => {
	const headers = {
		'Content-Type': 'application/json',
		//'HPECLIENTTYPE': 'HPE_REST_API_TECH_PREVIEW',
		'HPECLIENTTYPE': 'IT_PRIVATE'
		//'ALM_OCTANE_TECH_PREVIEW': 'true'
	};
	cookieJar.getCookieString(process.env.SERVER_DOMAIN, {allPaths: true}, function (err, cookies) {
		if (cookies) {
			headers['Cookie'] = cookies;
		}
	});
	return headers;
};

const getHistoryLogsBatch = async (action, fieldName, fromTimestamp, toTimestamp, limit) => {
	let url = apiUrl + `/history_logs?query="timestamp>=^${fromTimestamp}^;timestamp<=^${toTimestamp}^;entity_type=^defect^;action=^${action}^;field_name=^${fieldName}^"&limit=${limit}`;
	try {
		const audits = await getFromOctane(url);
		if (audits && audits.data && audits.data.length > 0) {
			return audits;
		} else {
			return null;
		}
	} catch (err) {
		logger.logFuncError('getHistoryLogsBatch', err);
		return null;
	}
};

module.exports = {
	verifyUserTag,
	postToOctane,
	getTotalNumberOfEntities,
	updateMultipleEntitiesUserTags,
	getLastEntities,
	getTaggedEntities,
	getHistoryLogsBatch,
};
