const axios = require('axios');
const createError = require('http-errors');
const { cloneDeep } = require('lodash');
const ERROR = require('./constants/error');
const GIT = require('./constants/git');
const { AT_SIGN_END, AT_SIGN_BEGIN } = require('./constants/stringProcessing');
const STRING_PROCESSING = require('./constants/stringProcessing');

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

const getFileName = (file) => {
  const result = file.split('\n')[0].split(' b/')[1];

  // TODO: encoding issue

  return result;
};

const getLineAndOffsetNumbers = (lineNumbers, minusIndex, spacePlusIndex) => {
  const [beforeLine, beforeOffset] = lineNumbers
    .slice(minusIndex + STRING_PROCESSING.MINUS.length, spacePlusIndex)
    .split(',')
    .map(Number);
  const [afterLine, afterOffset] = lineNumbers
    .slice(spacePlusIndex + STRING_PROCESSING.SPACE_PLUS.length)
    .split(',')
    .map(Number);

  return {
    before: {
      line: beforeLine,
      offset: beforeOffset,
    },
    after: {
      line: afterLine,
      offset: afterOffset,
    },
  };
};

const createFilePositionObject = (matchedString, before, after, index) => ({
  matchedString,
  before,
  after,
  index,
});

const getChangedFilePosition = (file, regex) => {
  const result = [];

  const TRUE = true;
  while (TRUE) {
    const execResultArray = regex.exec(file);

    if (execResultArray === null) {
      break;
    }

    const [matchedString] = execResultArray;
    const lineNumbers = matchedString.slice(
      AT_SIGN_BEGIN.length,
      -AT_SIGN_END.length
    );

    const minusIndex = lineNumbers.indexOf(STRING_PROCESSING.MINUS);
    const spacePlusIndex = lineNumbers.indexOf(STRING_PROCESSING.SPACE_PLUS);

    const { before, after } = getLineAndOffsetNumbers(
      lineNumbers,
      minusIndex,
      spacePlusIndex
    );

    result.push(
      createFilePositionObject(matchedString, before, after, regex.lastIndex)
    );
  }

  return result;
};

module.exports = {
  hasGitExtension,
  getRepoName,
  changeBranchNameFormat,
  getDiff,
  getFileName,
  getChangedFilePosition,
};
