'use strict';
let checkersConfig = {
	defectsTotalDataSetSize: 5000,
	checkers: [
		{
			name: 'defect-stuck-phase',
			tag: 'Stuck in Phase',
			entity: 'defect',
			enabled: true,
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
						'phase.defect.new': 7,
						'phase.defect.opened': 7,
						'phase.defect.fixed': 7,
						'_DEFAULT': 7 //every other non-specified phase
					},
					'list_node.severity.medium': {
						'phase.defect.new': 99,
						'phase.defect.opened': 99,
						'phase.defect.fixed': 99,
						'_DEFAULT': 99 //every other non-specified phase
					},
					'list_node.severity.low': {
						'phase.defect.new': 99,
						'phase.defect.opened': 99,
						'phase.defect.fixed': 99,
						'_DEFAULT': 99 //every other non-specified phase
					},
					'_DEFAULT': { //every other non-specified severity
						'_DEFAULT': 30 //every other non-specified phase
					}
				}
			}
		},
		{
			name: 'defect-unusual-dev-owner',
			tag: 'Unusual DEV Owner',
			entity: 'defect',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.fixed'
				],
				maxDataSetSize: 1000
			}
		},
		{
			name: 'defect-unusual-qa-owner',
			tag: 'Unusual QA Owner',
			entity: 'defect',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'phase.defect.duplicate',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/
				],
				maxDataSetSize: 1000
			}
		},
		{
			name: 'defect-many-comments',
			tag: 'Many Comments',
			entity: 'defect',
			enabled: true,
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
			name: 'defect-many-owners',
			tag: 'Many Owners',
			entity: 'defect',
			enabled: true,
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
			name: 'defect-large-attachments',
			tag: 'Large Attachments',
			entity: 'defect',
			enabled: true,
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
            name: 'defect-inactive-dev-owner',
	        tag: 'Inactive DEV Owner 333',
	        entity: 'defect',
            enabled: true,
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
            name: 'defect-inactive-qa-owner',
	        tag: 'Inactive QA Owner',
	        entity: 'defect',
            enabled: true,
            options: {
	            phasesToIgnore: [
		            'phase.defect.closed',
		            'phase.defect.duplicate',
		            'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/
	            ]
            }
        }
	]
};

module.exports = checkersConfig;
