const GIT = {
  VALID_URL_LENGTH: 5,
  LOG_OPTION_ALL: '--all',
  CLONE_OPTION_NO_CHECK_OUT: '--no-checkout',
  PRETTY_FORMAT_OPTIONS: {
    message: '%s',
    author: '%an',
    committer: '%cn',
    parents: '%P',
    hash: '%H',
    branchName: '%S',
  },
  GIT_EXTENSION: '.git',
};

module.exports = GIT;
