const { cloneDeep } = require('lodash');
const CONSTANTS = require('./constants/constants');

function checkIfUrlHasDotGit(repoName) {
  return repoName.slice(-4) === CONSTANTS.DOT_GIT;
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
