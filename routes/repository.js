const express = require('express');

const router = express.Router();
const path = require('path');
const simpleGit = require('simple-git');
const validator = require('validator');
const rimraf = require('rimraf');
const createError = require('http-errors');

const ERROR = require('../constants/errorConstants');
const CONSTANTS = require('../constants/constants');
const { checkIfUrlHasDotGit, changeBranchNameFormat } = require('../utils');

router.get('/', async (req, res, next) => {
  try {
    const { repoUrl } = req.body;

    if (!validator.isURL(repoUrl)) {
      throw createError(401, ERROR.INVALID_REPO_URL);
    }

    const repoUrlLength = repoUrl.split('/').length;

    if (repoUrlLength !== CONSTANTS.VALID_URL_LENGTH) {
      throw createError(401, ERROR.INVALID_REPO_URL);
    }

    let repoName = repoUrl.split('/')[4];

    if (checkIfUrlHasDotGit(repoName)) {
      repoName = repoName.slice(0, -4);
    }

    const logOption = [CONSTANTS.LOG_OPTION_ALL];
    const cloneOption = [CONSTANTS.CLONE_OPTION_NO_CHECK_OUT];
    const formatOptions = {
      format: CONSTANTS.PRETTY_FORMAT_OPTIONS,
    };

    if (!repoUrl.trim()) {
      throw createError(401, ERROR.INVALID_REPO_URL);
    }

    if (!repoName.trim()) {
      throw createError(401, ERROR.INVALID_REPO_URL);
    }

    try {
      await simpleGit().clone(repoUrl, cloneOption);
    } catch (err) {
      throw createError(401, ERROR.FAIL_TO_CLONE);
    }

    const clonedGit = await simpleGit(path.resolve(`./${repoName}`));

    if (!clonedGit) {
      throw createError(401, ERROR.GIT_NOT_FOUND);
    }

    const log = await clonedGit.log(logOption, formatOptions);
    const logList = log.all;

    changeBranchNameFormat(logList);

    if (!log) {
      throw createError(401, ERROR.FAIL_TO_LOG);
    }

    const data = {
      repoName,
      branchList: logList,
    };

    await rimraf(`./${repoName}`, (err) => {
      if (err) {
        next(err);
      }
    });

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
