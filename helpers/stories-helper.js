'use strict';
const commonHelper = require('./common-helper');

const initCheckerResult = (checkerName) => {
	return commonHelper.initCheckerResult(checkerName);
};

const getStoryDetailsStr = (s) => {
	return `${s.phase ? s.phase.name : '<No Phase>'} | ${s.team ? s.team.name : '<No Team>'} | ${commonHelper.getEntityOwnersStr(s)} | #${s.id || '<No ID>'} | ${s.name || '<No Name>'}`;
};

const addStoryAnomaly = (checkerResult, s, text) => {
	checkerResult.anomalies[s.id] = {
		e: s,
		checkerName: checkerResult.checkerName,
		text: `${text} | ${getStoryDetailsStr(s)}`
	};
};

module.exports = {
	initCheckerResult,
	addStoryAnomaly
};
