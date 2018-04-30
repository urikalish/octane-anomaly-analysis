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
					'new': 90,
					'opened': 60,
					'fixed': 30,
					'_DEFAULT': 30 //every other non-specified phase
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
