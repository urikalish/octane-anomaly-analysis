'use strict';
let checkersConfig = {
	defectsTotalDataSetSize: 5000,
	checkers: [
		{
			name: 'defect-large-attachments',
			//enabled: false,
			options: {
				phasesToIgnore: ['closed', 'rejected', 'duplicate'],
				fileExtensionsToIgnoreRegex: /(.png|.jpg)$/,
				attachmentsMaxSizeMB: 10
			}
		},
		{
			name: 'defect-many-comments',
			//enabled: false,
			options: {
				phasesToIgnore: ['closed','rejected','duplicate','fixed'],
				manyCommentsCount: 8
			}
		},
		{
			name: 'defect-many-owners',
			//enabled: false,
			options: {
				phasesToIgnore: ['closed','rejected','duplicate'],
				manyOwnersCount: 5
			}
		},
		{
			name: 'defect-stuck-phase',
			//enabled: false,
			options: {
				phasesToIgnore: ['closed','rejected','duplicate'],
				phasesMaxDays: {
					'_DEFAULT': 90,
					'new': 90,
					'opened': 90,
					'fixed': 90
				}
			}
		},
		{
			name: 'defect-unusual-owner',
			//enabled: false,
			options: {
				phasesToIgnore: ['closed','rejected','duplicate','fixed'],
				maxDataSetSize: 3000
			}
		}
	]
};

module.exports = checkersConfig;
