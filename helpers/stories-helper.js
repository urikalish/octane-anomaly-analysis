'use strict';
const commonHelper = require('./common-helper');

const initCheckerResult = (checkerName) => {
	return commonHelper.initCheckerResult(checkerName);
};

const getStoryDetailsStr = (s) => {
	return `${s.phase ? s.phase.name : '<No Phase>'} | ${s.team ? s.team.name : '<No Team>'} | ${commonHelper.getEntityOwnersStr(s)} | #${s.id || '<No ID>'} | ${s.name || '<No Name>'}`;
};

const addStoryAnomaly = (checkerResult, e, text) => {
	commonHelper.addAnomaly(checkerResult, e, `${text} | ${getStoryDetailsStr(e)}`);
};

module.exports = {
	initCheckerResult,
	addStoryAnomaly
};
