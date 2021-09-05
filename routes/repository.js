const express = require('express');

const router = express.Router();
const path = require('path');
const simpleGit = require('simple-git');
const validator = require('validator');
const rimraf = require('rimraf');
const createError = require('http-errors');

const ERROR = require('../constants/errorConstants');
const GIT = require('../constants/gitConstants');
const { checkIfUrlHasDotGit, changeBranchNameFormat } = require('../utils');

router.get('/', async (req, res, next) => {
  const logOption = [GIT.LOG_OPTION_ALL];
  const cloneOption = [GIT.CLONE_OPTION_NO_CHECK_OUT];
  const formatOptions = {
    format: GIT.PRETTY_FORMAT_OPTIONS,
  };

  try {
    const { repoUrl } = req.body;

    if (!repoUrl.trim()) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    if (!validator.isURL(repoUrl)) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    const repoUrlLength = repoUrl.split('/').length;

    if (repoUrlLength !== GIT.VALID_URL_LENGTH) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    let repoName = repoUrl.split('/')[4];

    if (!repoName.trim()) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    if (checkIfUrlHasDotGit(repoName)) {
      repoName = repoName.slice(0, -4);
    }

    try {
      await simpleGit().clone(repoUrl, cloneOption);
    } catch (err) {
      throw createError(500, ERROR.FAIL_TO_CLONE);
    }

    const clonedGit = await simpleGit(path.resolve(`./${repoName}`));

    if (!clonedGit) {
      throw createError(400, ERROR.GIT_NOT_FOUND);
    }

    const log = await clonedGit.log(logOption, formatOptions);
    const logList = log.all;

    const formattedLogList = changeBranchNameFormat(logList);

    if (!log) {
      throw createError(401, ERROR.FAIL_TO_LOG);
    }

    const data = {
      repoName,
      branchList: formattedLogList,
    };

    rimraf(`./${repoName}`, (err) => {
      if (err) {
        throw createError(500, ERROR.FAIL_TO_DELETE_CLONED_DIRECTORY);
      }
    });

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
