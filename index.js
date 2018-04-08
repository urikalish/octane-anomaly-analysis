'use strict';
const apiService = require('./api-service');
const dataProvider = require('./data-provider');
const defectUnusualOwner = require('./checkers/defect-unusual-owner');
const defectCommentsNumber = require('./checkers/defect-comments-number');

function run() {
	apiService.authenticate().then(
		(/*result*/) => {
			console.log('Authenticated - OK');

			dataProvider.getDefects(1000).then(
				(result) => {
					console.log('Get defects - OK');
					//console.log(result.data[0]);
					defectUnusualOwner.check(result.data);
					defectCommentsNumber.check(result.data);
				}
			);
		},
		(reason) => {
			console.log('Authenticated Error - ' + reason);
		}
	);
}

run();

// 	apiService.getEntity(getAuditUri(d.id)).then((result) => {
// 		if (result.data) {
// 			result.data.forEach(h => {
// 				defects[d.id].history.push(h);
// 				if (h['property_name'] === 'owner') {
// 					owners.push((h['new_value'] ? h['new_value'].replace(/<html><body>/g, '').replace(/<\/body><\/html>/g, '').trim() : '<empty>'))
// 				}
// 			});
// 			if (owners.length > 2) {
// 				console.log(`${d.id}\t| ${d.phase.name}\t| ${d.name}\t| ${owners}`);
// 			}
// 		}
// 	});
// });
// let urlOneDefectHistory = getHistoryUri('605030', 'defect');
// let urlOneDefectUri = getDefectsUri(false, 0, 10, `id='605030'`, 'id,name');

