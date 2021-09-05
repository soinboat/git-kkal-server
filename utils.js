const CONSTANTS = require('./constants/constants');

function checkIfUrlHasDotGit(repoName) {
  return repoName.slice(-4) === CONSTANTS.DOT_GIT;
}

function changeBranchNameFormat(logList) {
  logList.forEach((log) => {
    const arr = log.branchName.split('/');

    // eslint-disable-next-line no-param-reassign
    log.branchName = arr[arr.length - 1];
  });
}

module.exports = {
  checkIfUrlHasDotGit,
  changeBranchNameFormat,
};
