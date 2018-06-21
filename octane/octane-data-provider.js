'use strict';
const helper = require('../helper/helper');
const envConfig = require('../config/environment-config');
const apiUrl = `${envConfig.serverAddress}/api/shared_spaces/${envConfig.sharedspaceId}/workspaces/${envConfig.workspaceId}`;
let request = require('request');
if (envConfig.proxy) {
	request = request.defaults({'proxy': envConfig.proxy});
}
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar(undefined, {rejectPublicSuffixes: false});

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
				helper.logError(response.statusCode + ' ' + response.statusMessage);
				return reject({
					statusCode: response.statusCode,
					message: response.statusMessage,
					description: response.statusMessage
					//message: JSON.parse(response.body).description,
					//description: JSON.parse(response.body)
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

function postToOctane(uri, body, formData) {
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
			if (response.statusCode < 200 || response.statusCode > 299) {
				helper.logError(response.statusCode + ' ' + response.statusMessage);
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
							helper.logError(error);
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

function getHistoryUri(entityId, entityType) {
	return apiUrl +	`/historys?query="entity_id=${entityId};entity_type='${entityType || 'defect'}'"`
}

function getHistory(entityId) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getHistoryUri(entityId);
		getFromOctane(uri).then(
		(result) => {
			resolve(result);
		},
		(reason) => {
			helper.logError('Error on getHistory() ' + reason);
		}
		);
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
		(reason) => {
			helper.logError('Error on getAttachment() ' + reason);
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

function getDefectsBatch(offset, limit) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getDefectsUri(false, offset, limit, '', '');
		getFromOctane(uri).then(
			(result) => {
				resolve(result);
			},
			(reason) => {
				helper.logError('Error on getDefectsBatch() - ' + reason.message);
			}
		);
	});
}

function getLastDefects(needed) {
	return new Promise((resolve /*, reject*/) => {
		let offset = 0;
		let batch = 100;
		let promises = [];
		while (needed > offset) {
			let limit = ((needed - offset) >  batch) ? batch : needed - offset;
			promises.push(getDefectsBatch(offset, limit));
			offset += batch;
		}
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
			}
		);
	});
}

function verifyUserTag(tagName) {
	let url = apiUrl +	`/user_tags?query="(((name='${tagName}')))"&fields=id,name`;
	return getFromOctane(url).then((results) => {
		if (results && results['total_count'] !== 0) {
			helper.logMessage('User tag "' + tagName + '" exists with id ' + results.data[0].id);
		} else {
			helper.logMessage('Creating user tag "' + tagName + '"...');
			url = apiUrl + '/user_tags';
			let body = {
				data: [{name: tagName}]
			};
			return postToOctane(url, body).then((result) => {
				helper.logMessage('User tag "' + tagName + '" created with id ' + result.body.data[0].id);
				return result.body.data[0];
			})
		}
		return results.data[0];
	});
}

function getTaggedDefects(userTagId) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getDefectsUri(false, 0, 1000, `(user_tags={id=${userTagId}})`, '');
		getFromOctane(uri).then(
		(result) => {
			resolve(result);
		},
		(reason) => {
			helper.logError('Error on getTaggedDefects() - ' + reason.message);
		}
		);
	});
}

module.exports = {
	verifyUserTag: verifyUserTag,
	postToOctane: postToOctane,
	getLastDefects: getLastDefects,
	getTaggedDefects: getTaggedDefects,
	getHistory: getHistory,
	getAttachment: getAttachment
};
