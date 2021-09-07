const axios = require('axios');
const createError = require('http-errors');
const { cloneDeep } = require('lodash');
const ERROR = require('./constants/error');
const GIT = require('./constants/git');

const hasGitExtension = (repoName) => repoName.slice(-4) === GIT.GIT_EXTENSION;

const getRepoName = (repoUrl) =>
  hasGitExtension(repoUrl.split('/')[4])
    ? repoUrl.split('/')[4].slice(0, -4)
    : repoUrl.split('/')[4];

const changeBranchNameFormat = (logList) =>
  cloneDeep(logList).map((log) => {
    const splittedBranchName = log.branchName2.split('/');

    return {
      ...log,
      branchName2: splittedBranchName[splittedBranchName.length - 1],
    };
  });

// eslint-disable-next-line consistent-return
const getDiff = async (url) => {
  try {
    const data = await axios.get(url);

    return data;
  } catch (err) {
    if (err.response) {
      throw createError(500, ERROR.FAIL_TO_GET_DIFF);
    }
  }
};

module.exports = {
  hasGitExtension,
  getRepoName,
  changeBranchNameFormat,
  getDiff,
};
