const { cloneDeep } = require('lodash');
const GIT = require('./constants/gitConstants');

function hasGitExtension(repoName) {
  return repoName.slice(-4) === GIT.GIT_EXTENSION;
}

function changeBranchNameFormat(logList) {
  return cloneDeep(logList).map((log) => {
    const splittedBranchName = log.branchName.split('/');

    return {
      ...log,
      branchName: splittedBranchName[splittedBranchName.length - 1],
    };
  });
}

module.exports = {
  hasGitExtension,
  changeBranchNameFormat,
};
