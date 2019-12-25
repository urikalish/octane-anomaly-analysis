'use strict';
const commonHelper = require('./common-helper');

const initCheckerResult = (checkerName) => {
	return commonHelper.initCheckerResult(checkerName);
};

const getQualityStoryDetailsStr = (qs) => {
	return `${qs.phase ? qs.phase.name : '<No Phase>'} | ${qs.team ? qs.team.name : '<No Team>'} | ${commonHelper.getEntityOwnersStr(qs)} | #${qs.id || '<No ID>'} | ${qs.name || '<No Name>'}`;
};

const addQualityStoryAnomaly = (checkerResult, e, text) => {
	commonHelper.addAnomaly(checkerResult, e, `${text} | ${getQualityStoryDetailsStr(e)}`);
};

module.exports = {
	initCheckerResult,
	addQualityStoryAnomaly
};
