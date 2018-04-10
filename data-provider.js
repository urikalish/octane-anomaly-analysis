const config = require('./config');
const apiService = require('./api-service');

function getHistoryUri(entityId, entityType) {
	return config.api_url +	`/historys?query="entity_id=${entityId};entity_type='${entityType || 'defect'}'"`
}

function getHistory(entityId) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getHistoryUri(entityId);
		apiService.getEntity(uri).then(
		(result) => {
			resolve(result);
		},
		(reason) => {
			console.log('Error on getHistory() ' + reason);
		}
		);
	});
}

function getDefectsUri(isAsc, offset, limit, querySuffix, fields) {
	return config.api_url +
	`/work_items` +
	`?order_by=${isAsc ? '' : '-'}id` +
	`&offset=${offset || 0}` +
	`&limit=${limit || 1}` +
	`&query="((subtype='defect')${(querySuffix ? ';' + querySuffix : '')})"` +
	`&fields=${fields || 'creation_time,suite_run,parent,defect_root_level,version_stamp,release,workspace_id,num_comments,path,wsjf_cod,rank,last_modified,phase,subtype_label,fixed_on,rroe,has_children,priority,user_tags,taxonomies,defects,estimated_hours,user_stories,initial_estimate,ordering,blocked,invested_hours,items_in_releases,logical_path,has_attachments,epic_type,story_points,quality_stories,global_text_search_result,total_risky_commits,team,time_criticality,cycle_time_expiration,progress,original_id,business_value,actual_story_points,sprint,fixed_in_build,features,item_origin,committers,commits_summary,quality_story_type,ancestors,defect_type,client_lock_stamp,author,product_areas,remaining_hours,last_runs,commit_files,commit_count,has_comments,tasks_number,name,detected_in_build,logical_name,description,detected_in_release,phase_to_time_in_phase,total_commits,requirement_feature,wsjf_score,detected_by,qa_owner,subtype,is_draft,closed_on,feature_count,new_tasks,owner,severity,requirements,feature_type,blocked_reason,job_size,time_in_current_phase,comments'}`;
}

function getDefectsBatch(offset, limit) {
	return new Promise((resolve /*, reject*/) => {
		let uri = getDefectsUri(false, offset, limit, '', '');
		apiService.getEntity(uri).then(
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
	getDefects: getDefects,
	getHistory: getHistory
};