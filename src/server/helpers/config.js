/* Pull in environment-specific configuration. */
var env = process.env.NODE_ENV || "development";
var config = require('../../../config/' + env);

module.exports = config;
