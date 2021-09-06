const validator = require('validator');
const createError = require('http-errors');

const GIT = require('../constants/gitConstants');
const ERROR = require('../constants/errorConstants');
const { getRepoName } = require('../utils');

const repoUrlValidator = (req, res, next) => {
  try {
    const { repoUrl } = req.query;
    const repoUrlLength = repoUrl.split('/').length;

    if (!repoUrl.trim()) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    if (!validator.isURL(repoUrl)) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    if (repoUrlLength !== GIT.VALID_URL_LENGTH) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    const repoName = getRepoName(repoUrl);

    if (!repoName.trim()) {
      throw createError(400, ERROR.INVALID_REPO_URL);
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = repoUrlValidator;
