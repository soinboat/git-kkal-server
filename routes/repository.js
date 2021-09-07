const express = require('express');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const createError = require('http-errors');

const router = express.Router();

const {
  changeBranchNameFormat,
  getRepoName,
  getFileName,
  getChangedFilePosition,
  getDiff,
  getChangedFileLog,
} = require('../utils');
const ERROR = require('../constants/error');
const GIT = require('../constants/git');
const REGEX = require('../constants/regex');
const repoUrlValidator = require('../middlewares/repoUrlValidator');
const STRING_PROCESSING = require('../constants/stringProcessing');

router.get('/diff', async (req, res, next) => {
  const { hostName, userName, repoName, commitHash } = req.query;

  const url = `http://${hostName}.com/${userName}/${repoName}/commit/${commitHash}.diff`;

  const result = {
    changedFileList: [],
  };

  try {
    const { data } = await getDiff(url);

    const [, ...fileList] = data.split(STRING_PROCESSING.DIFF_GIT);

    if (fileList.length < 1) {
      throw createError(500, ERROR.FILE_NOT_FOUND);
    }

    fileList.forEach((file) => {
      const fileName = getFileName(file);

      const changedFileInfoList = getChangedFilePosition(
        file,
        REGEX.FILE_LINE_OFFSET
      );

      const changedFileInfoAndLogList = getChangedFileLog(
        file,
        changedFileInfoList
      );

      const changedLog = changedFileInfoAndLogList.map(
        ({ codeBeginHunk, before, after }) => ({
          codeBeginHunk,
          before,
          after,
        })
      );

      result.changedFileList.push({
        fileName,
        changedLog,
      });
    });
  } catch (err) {
    next(err);
  }

  res.status(200).json(result);
});

router.get('/', repoUrlValidator, async (req, res, next) => {
  const logOption = [GIT.LOG_OPTION_ALL];
  const cloneOption = [GIT.CLONE_OPTION_NO_CHECK_OUT];
  const formatOptions = {
    format: GIT.PRETTY_FORMAT_OPTIONS,
  };

  try {
    const { repoUrl } = req.query;

    const repoName = getRepoName(repoUrl);

    try {
      await simpleGit().clone(repoUrl, cloneOption);
    } catch (err) {
      throw createError(500, ERROR.FAIL_TO_CLONE);
    }

    const clonedGit = await simpleGit(path.resolve(`./${repoName}`));

    if (!clonedGit) {
      throw createError(400, ERROR.GIT_NOT_FOUND);
    }

    const { all: logList } = await clonedGit.log(logOption, formatOptions);

    const formattedLogList = changeBranchNameFormat(logList);

    if (!logList) {
      throw createError(401, ERROR.FAIL_TO_LOG);
    }

    const data = {
      repoName,
      branchList: formattedLogList,
    };

    fs.rmdir(`./${repoName}`, { recursive: true }, (err) => {
      if (err) {
        throw createError(401, ERROR.FAIL_TO_DELETE_CLONED_DIRECTORY);
      }

      res.status(200).json(data);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
