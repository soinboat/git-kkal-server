const express = require('express');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const createError = require('http-errors');

const router = express.Router();

const repoUrlValidator = require('../middlewares/repoUrlValidator');

const { getDiff } = require('./controller/repository.controller');

const { changeBranchNameFormat, getRepoName } = require('../utils/git');
const graphDataGenerator = require('../utils/graphDataGenerator');
const { parseDiffToObject } = require('../utils/diff');

const STRING_PROCESSING = require('../constants/stringProcessing');
const ERROR = require('../constants/error');
const GIT = require('../constants/git');

router.get('/diff', async (req, res, next) => {
  const { repoUrl, commitHash } = req.query;

  const url = `${repoUrl}/commit/${commitHash}.diff`;

  const result = {
    changedFileList: [],
  };

  try {
    const { data } = await getDiff(url);

    const fileList = data.split(STRING_PROCESSING.DIFF_GIT).slice(1);

    if (!fileList.length) {
      throw createError(500, ERROR.FILE_NOT_FOUND);
    }

    result.changedFileList = parseDiffToObject(fileList);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/', repoUrlValidator, async (req, res, next) => {
  const logOption = [GIT.LOG_OPTION_ALL];
  const cloneOption = [GIT.CLONE_OPTION_NO_CHECK_OUT];
  const formatOptions = {
    format: GIT.PRETTY_FORMAT_OPTIONS,
  };

  const { repoUrl } = req.query;
  const repoName = getRepoName(repoUrl);

  try {
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
      logList: graphDataGenerator(formattedLogList),
    };

    fs.rmdir(`./${repoName}`, { recursive: true }, (err) => {
      if (err) {
        throw createError(401, ERROR.FAIL_TO_DELETE_CLONED_DIRECTORY);
      }

      res.status(200).json(data);
    });
  } catch (err) {
    fs.rmdir(`./${repoName}`, { recursive: true }, () => {
      next(err);
    });
  }
});

module.exports = router;
