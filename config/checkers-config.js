'use strict';
let checkersConfig = {
	defectsTotalDataSetSize: 5000,
	checkers: [
		{
			name: 'defect-stuck-phase',
			enabled: true,
			options: {
				phasesToIgnore: [
					'closed',
					'rejected',
					'duplicate'
				],
				phasesMaxDays: {
					'list_node.severity.critical': {
						'new': 7,
						'opened': 7,
						'fixed': 7,
						'_DEFAULT': 7 //every other non-specified phase
					},
					'list_node.severity.very_high': {
						'new': 14,
						'opened': 14,
						'fixed': 14,
						'_DEFAULT': 14 //every other non-specified phase
					},
					'list_node.severity.high': {
						'new': 21,
						'opened': 21,
						'fixed': 21,
						'_DEFAULT': 21 //every other non-specified phase
					},
					'list_node.severity.medium': {
						'new': 28,
						'opened': 28,
						'fixed': 28,
						'_DEFAULT': 28 //every other non-specified phase
					},
					'list_node.severity.low': {
						'new': 35,
						'opened': 35,
						'fixed': 35,
						'_DEFAULT': 35 //every other non-specified phase
					},
					'_DEFAULT': {
						'new': 60,
						'opened': 60,
						'fixed': 60,
						'_DEFAULT': 60 //every other non-specified phase
					}
				}
			}
		},
		{
			name: 'defect-unusual-owner',
			enabled: true,
			options: {
				phasesToIgnore: [
					'closed',
					'rejected',
					'duplicate',
					'fixed'
				],
				maxDataSetSize: 3000
			}
		},
		{
			name: 'defect-many-comments',
			enabled: true,
			options: {
				phasesToIgnore: [
					'closed',
					'rejected',
					'duplicate',
					'fixed'
				],
				manyCommentsCount: 7
			}
		},
		{
			name: 'defect-many-owners',
			enabled: true,
			options: {
				phasesToIgnore: [
					'closed',
					'rejected',
					'duplicate',
					'fixed'
				],
				manyOwnersCount: 5
			}
		},
		{
			name: 'defect-large-attachments',
			enabled: true,
			options: {
				phasesToIgnore: [
					'closed',
					'rejected',
					'duplicate'
				],
				fileExtensionsToIgnoreRegex: /(.png|.jpg)$/,
				attachmentsLargeSizeMB: 10
			}
		}
	]
};

module.exports = checkersConfig;
