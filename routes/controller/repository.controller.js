const axios = require('axios');
const createError = require('http-errors');
const ERROR = require('../../constants/error');

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

module.exports = { getDiff };
