'use strict';
let checkersConfig = {
	defectsTotalDataSetSize: 5000,
	checkers: [
		{
			name: 'defect-stuck-phase',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.duplicate'
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
			name: 'defect-unusual-owner',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.duplicate',
					'phase.defect.fixed'
				],
				maxDataSetSize: 3000
			}
		},
		{
			name: 'defect-many-comments',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.duplicate',
					'phase.defect.fixed'
				],
				manyCommentsCount: 7
			}
		},
		{
			name: 'defect-many-owners',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.duplicate',
					'phase.defect.fixed'
				],
				manyOwnersCount: 5
			}
		},
		{
			name: 'defect-large-attachments',
			enabled: true,
			options: {
				phasesToIgnore: [
					'phase.defect.closed',
					'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
					'phase.defect.duplicate'
				],
				fileExtensionsToIgnoreRegex: /(.png|.jpg)$/,
				attachmentsLargeSizeMB: 10
			}
		},
        {
            name: 'defect-non-active-owner',
            enabled: true,
            options: {
                phasesToIgnore: [
                    'phase.defect.closed',
                    'n4e05glkovrvs1kz6l6ly9lq3' /*rejected*/,
                    'phase.defect.duplicate',
                    'phase.defect.fixed'
                ],
                maxDataSetSize: 3000
            }
        },
	]
};

module.exports = checkersConfig;
