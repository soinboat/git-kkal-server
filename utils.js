const { cloneDeep } = require('lodash');
const GIT = require('./constants/gitConstants');

function checkIfUrlHasDotGit(repoName) {
  return repoName.slice(-4) === GIT.DOT_GIT;
}

function changeBranchNameFormat(logList) {
  const logListCopy = cloneDeep(logList).map((log) => {
    const splittedBranchName = log.branchName.split('/');

    return {
      ...log,
      branchName: splittedBranchName[splittedBranchName.length - 1],
    };
  });

  return logListCopy;
}

module.exports = {
  checkIfUrlHasDotGit,
  changeBranchNameFormat,
};
