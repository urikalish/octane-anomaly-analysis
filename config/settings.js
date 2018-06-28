'use strict';
let settings = {
	generalAnomalyTag: 'Anomaly',
	specificAnomalyTagPrefix: 'Anomaly: ',
	ignoreAnomalyTag: 'Ignore Anomaly',
	defectsTotalDataSetSize: 15000,
	saveToStorage: true,
	updateOctane: true,
	checkers: [
		{
			enabled: true,
			name: 'defect-inactive-dev-owner',
			tag: 'Anomaly: Inactive DEV Owner',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.fixed'
				]
			}
		},
		{
			enabled: true,
			name: 'defect-inactive-qa-owner',
			tag: 'Anomaly: Inactive QA Owner',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/
				]
			}
		},
		{
			enabled: true,
			name: 'defect-large-attachments',
			tag: 'Anomaly: Large Attachments',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/
				],
				fileExtensionsToIgnoreRegex: /(.png|.jpg)$/,
				attachmentsLargeSizeMB: 10
			}
		},
		{
			enabled: true,
			name: 'defect-many-comments',
			tag: 'Anomaly: Many Comments',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.fixed'
				],
				manyCommentsCount: 7
			}
		},
		{
			enabled: true,
			name: 'defect-many-owners',
			tag: 'Anomaly: Many Owners',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.fixed'
				],
				manyOwnersCount: 5
			}
		},
		{
			enabled: true,
			name: 'defect-stuck-phase',
			tag: 'Anomaly: Stuck in Phase',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/
				],
				phasesMaxDays: {
					'list_node.severity.urgent': {
						'phase.defect.new': 1,
						'phase.defect.opened': 3,
						'phase.defect.fixed': 2,
						'_DEFAULT': 3 //every other non-specified phase
					},
					'list_node.severity.very_high': {
						'phase.defect.new': 7,
						'phase.defect.opened': 7,
						'phase.defect.fixed': 7,
						'_DEFAULT': 7 //every other non-specified phase
					},
					'list_node.severity.high': {
						'phase.defect.new': 30,
						'phase.defect.opened': 7,
						'phase.defect.fixed': 7,
						'_DEFAULT': 30 //every other non-specified phase
					},
					'list_node.severity.medium': {
						'phase.defect.new': 60,
						'phase.defect.opened': 7,
						'phase.defect.fixed': 7,
						'_DEFAULT': 99 //every other non-specified phase
					},
					'list_node.severity.low': {
						'phase.defect.new': 60,
						'phase.defect.opened': 7,
						'phase.defect.fixed': 7,
						'_DEFAULT': 99 //every other non-specified phase
					},
					'_DEFAULT': { //every other non-specified severity
						'_DEFAULT': 30 //every other non-specified phase
					}
				}
			}
		},
		{
			enabled: true,
			name: 'defect-unusual-dev-owner',
			tag: 'Anomaly: Unusual DEV Owner',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.fixed'
				],
				maxDataSetSize: 2500
			}
		},
		{
			enabled: true,
			name: 'defect-unusual-qa-owner',
			tag: 'Anomaly: Unusual QA Owner',
			entity: 'defect',
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/
				],
				maxDataSetSize: 2500
			}
		}
	]
};

module.exports = settings;
