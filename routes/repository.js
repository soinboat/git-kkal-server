const express = require('express');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const createError = require('http-errors');

const router = express.Router();
const repoUrlValidator = require('../middlewares/repoUrlValidator');
const graphDataGenerator = require('../utils/graphDataGenerator');
const { changeBranchNameFormat, getRepoName } = require('../utils/git');
const ERROR = require('../constants/error');
const GIT = require('../constants/git');

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
      logList: graphDataGenerator(formattedLogList),
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
