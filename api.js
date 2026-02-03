const router = require('express').Router();
const env = process.env.NODE_ENV || 'development';
require('dotenv').config();
const responseHandle = require('./src/helpers/responseHandle');
const responseCode = require('./src/helpers/responseCode.js');

router.use(function (req, res, next) {
  console.log('🛣️  Route not found:', req.method, req.path);
  return responseHandle.responseWithError(
    res,
    responseCode.NOT_FOUND,
    'Route Not Found!',
  );
});

module.exports = router;
