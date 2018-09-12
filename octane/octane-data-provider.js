'use strict';
const logger = require('../logger/logger');
const envConfig = require('../config/environment');
const apiUrl = `${envConfig.serverAddress}/api/shared_spaces/${envConfig.sharedspaceId}/workspaces/${envConfig.workspaceId}`;
let request = require('request');
if (envConfig.proxy) {
	request = request.defaults({'proxy': envConfig.proxy});
}
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar(undefined, {rejectPublicSuffixes: false});

let loadedCount = 0;
let loadedPercent = 0;

function getFromOctane(uri) {
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
}

function postToOctane(uri, body) {
	return new Promise((resolve, reject) => {
		let options = {
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
					cookieJar.setCookie(Cookie.parse(cookie), envConfig.domainName, {}, (error) => {
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
}

function putToOctane(uri, body, defectId) {
	return new Promise((resolve, reject) => {
		let options = {
			method: 'PUT',
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
				logger.logWarning(`Unable to update defect #${defectId} - ${response.statusCode}. ${response.statusMessage}. ${(JSON.parse(body)).description}`);
				return resolve(null);
			}
			if (response.headers['set-cookie']) {
				response.headers['set-cookie'].forEach((cookie) => {
					cookieJar.setCookie(Cookie.parse(cookie), envConfig.domainName, {}, (error) => {
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
}

function getHeaders() {
	let headers = {
		"Content-Type": "application/json",
		"HPECLIENTTYPE": "HPE_REST_API_TECH_PREVIEW"
	};
	cookieJar.getCookieString(envConfig.domainName, {allPaths: true}, function (err, cookies) {
		if (cookies) {
			headers['Cookie'] = cookies;
		}
	});

	return headers;
}

// function getHistoryUri(entityId, entityType) {
// 	return apiUrl +	`/historys?query="entity_id=${entityId};entity_type='${entityType || 'defect'}'"`
// }
//
// function getHistory(entityId) {
// 	return new Promise((resolve /*, reject*/) => {
// 		let uri = getHistoryUri(entityId);
// 		getFromOctane(uri).then(
// 		(result) => {
// 			resolve(result);
// 		},
// 		(err) => {
// 			logger.logWarning(`Unable to get history for entity #${entityId} - ${(err.message || err)}`);
// 			resolve(null);
// 		}
// 		);
// 	});
// }

function getHistoriesUri(entityIds, entityType) {
	return apiUrl +	`/historys?query="entity_id IN ${entityIds.join()};entity_type='${entityType || 'defect'}'"`
}

function getHistories(entityIds) {
	return new Promise((resolve /*, reject*/) => {
		let promises = [];
		let counter = 0;
		let ids = [];
		entityIds.forEach(id => {
			ids.push(id);
			counter++;
			if (counter % 10 === 0 || counter === entityIds.length) {
				promises.push(getFromOctane(getHistoriesUri(ids)));
				ids = [];
			}
		});
		Promise.all(promises).then(
		(results) => {
			let retVal = {
				data:[]
			};
			results.forEach(result => {
				result.data.forEach(d => {
					retVal.data.push(d);
				});
			});
			resolve(retVal);
		},
		(err) => {
			logger.logWarning(`Unable to get history for some entities - ${(err.message || err)}`);
			resolve(null);
		});
	});
}

function getAttachmentUri(entityId) {
	return apiUrl +	`/attachments?query="id=${entityId}"&fields=id,name,size`
}

function getAttachment(entityId) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getAttachmentUri(entityId);
		getFromOctane(uri).then(
		(result) => {
			resolve(result);
		},
		(err) => {
			logger.logWarning(`Unable to get attachment for entity #${entityId} - ${(err.message || err)}`);
			resolve(null);
		}
		);
	});
}

function getDefectsUri(isAsc, offset, limit, querySuffix, fields) {
	return apiUrl +
	`/work_items` +
	`?order_by=${isAsc ? '' : '-'}id` +
	`&offset=${offset || 0}` +
	`&limit=${limit || 1}` +
	`&query="((subtype='defect')${(querySuffix ? ';' + querySuffix : '')})"` +
	//`&fields=${fields || 'creation_time,suite_run,parent,defect_root_level,version_stamp,release,workspace_id,num_comments,path,wsjf_cod,rank,last_modified,phase,subtype_label,fixed_on,rroe,has_children,priority,user_tags,taxonomies,defects,estimated_hours,user_stories,initial_estimate,ordering,blocked,invested_hours,items_in_releases,logical_path,has_attachments,epic_type,story_points,quality_stories,global_text_search_result,total_risky_commits,team,time_criticality,cycle_time_expiration,progress,original_id,business_value,actual_story_points,sprint,fixed_in_build,features,item_origin,committers,commits_summary,quality_story_type,ancestors,defect_type,client_lock_stamp,author,product_areas,remaining_hours,last_runs,commit_files,commit_count,has_comments,tasks_number,name,detected_in_build,logical_name,description,detected_in_release,phase_to_time_in_phase,total_commits,requirement_feature,wsjf_score,detected_by,qa_owner,subtype,is_draft,closed_on,feature_count,new_tasks,owner,severity,requirements,feature_type,blocked_reason,job_size,time_in_current_phase,comments'}`;
	`&fields=${fields || 'id,name,severity,team,owner,qa_owner,phase,time_in_current_phase,comments,attachments,user_tags'}`;
}

function getTotalNumberOfDefects() {
	return new Promise((resolve, reject) => {
		let uri = getDefectsUri(false, 0, 1, '', '');
		getFromOctane(uri).then(
		(result) => {
			resolve(result['total_count']);
		},
		(err) => {
			logger.logFuncError('getTotalNumberOfDefects', err);
			reject(err);
		}
		);
	});
}

function getDefectsBatch(offset, limit, total) {
	return new Promise((resolve, reject) => {
		let uri = getDefectsUri(false, offset, limit, '', '');
		getFromOctane(uri).then(
			(result) => {
				loadedCount += limit;
				let per = Math.round(100.0 * loadedCount / total);
				if (per !== loadedPercent) {
					loadedPercent = per;
					logger.logMessage(`Retrieving defects... ${loadedPercent}%`);
				}
				resolve(result);
			},
			(err) => {
				logger.logFuncError('getDefectsBatch', err);
				reject(err);
			}
		);
	});
}

function getLastDefects(needed) {
	return new Promise((resolve, reject) => {
		let offset = 0;
		let batch = 500;
		let promises = [];
		while (needed > offset) {
			let limit = ((needed - offset) >  batch) ? batch : needed - offset;
			promises.push(getDefectsBatch(offset, limit, needed));
			offset += batch;
		}
		loadedCount = 0;
		Promise.all(promises).then(
			(batchResults) => {
				let data = [];
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
				resolve(data);
			},
			(err) => {
				reject(err);
			}
		);
	});
}

function verifyUserTag(tagName) {
	let url = apiUrl +	`/user_tags?query="(((name='${tagName}')))"&fields=id,name`;
	return getFromOctane(url).then((results) => {
		if (results && results['total_count'] !== 0) {
			logger.logMessage('User tag "' + tagName + '" exists with id ' + results.data[0].id);
		} else {
			logger.logMessage('Creating user tag "' + tagName + '"...');
			url = apiUrl + '/user_tags';
			let body = {
				data: [{name: tagName}]
			};
			return postToOctane(url, body).then((result) => {
				logger.logMessage('User tag "' + tagName + '" created with id ' + result.body.data[0].id);
				return result.body.data[0];
			})
		}
		return results.data[0];
	});
}

function getTaggedDefects(tagId1, tagId2) {
	return new Promise((resolve, reject) => {
		let uri = getDefectsUri(false, 0, 1000, `(user_tags={id IN '${tagId1}', '${tagId2}'})`, '');
		getFromOctane(uri).then(
		(result) => {
			resolve(result);
		},
		(err) => {
			logger.logFuncError('getTaggedDefects', err);
			reject(err);
		});
	});
}

function updateDefectUserTags(defectId, body) {
	let url =  `${apiUrl}/work_items/${defectId}`;
	return putToOctane(url, body, defectId);
}

module.exports = {
	verifyUserTag: verifyUserTag,
	postToOctane: postToOctane,
	//putToOctane: putToOctane,
	getTotalNumberOfDefects: getTotalNumberOfDefects,
	updateDefectUserTags: updateDefectUserTags,
	getLastDefects: getLastDefects,
	getTaggedDefects: getTaggedDefects,
	getHistories: getHistories,
	//getHistory: getHistory,
	getAttachment: getAttachment
};
