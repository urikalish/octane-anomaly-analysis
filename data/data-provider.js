'use strict';
const envConfig = require('../config/environment-config');
const apiUrl = `${envConfig.serverAddress}/api/shared_spaces/${envConfig.sharedspaceId}/workspaces/${envConfig.workspaceId}`;
let request = require('request');
if (envConfig.proxy) {
	request = request.defaults({'proxy': envConfig.proxy});
}
const tough = require('tough-cookie');
const Cookie = tough.Cookie;
const cookieJar = new tough.CookieJar(undefined, {rejectPublicSuffixes: false});

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

			//console.log(response);

			if (response.statusCode < 200 || response.statusCode > 299) {
				return reject({
					statusCode: response.statusCode,
					message: JSON.parse(response.body).description,
					description: JSON.parse(response.body)
				});
			}

			if (response.headers['set-cookie']) {
				response.headers['set-cookie'].forEach((cookie) => {
					cookieJar.setCookie(Cookie.parse(cookie), envConfig.domainName, {}, (error) => {
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
		getEntity(uri).then(
		(result) => {
			resolve(result);
		},
		(reason) => {
			console.log('Error on getHistory() ' + reason);
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
		getEntity(uri).then(
		(result) => {
			resolve(result);
		},
		(reason) => {
			console.log('Error on getAttachment() ' + reason);
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
	`&fields=${fields || 'id,name,severity,owner,qa_owner,phase,time_in_current_phase,comments,attachments'}`;
}

function getDefectsBatch(offset, limit) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getDefectsUri(false, offset, limit, '', '');
		getEntity(uri).then(
			(result) => {
				resolve(result);
			},
			(reason) => {
				console.log('Error on getDefectsBatch() ' + reason);
			}
		);
	});
}

function getDefects(needed) {
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

module.exports = {
	//getEntity: getEntity,
	postData: postData,
	getDefects: getDefects,
	getHistory: getHistory,
	getAttachment: getAttachment
};