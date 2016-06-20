module.exports = function (S3_wrapper) {
  
  var Promise = require('bluebird');
  var AWS     = require('aws-sdk');
  var s3      = new AWS.S3();
  var ajv     = require("ajv")({
    removeAdditional: false
  });
  Promise.promisifyAll(Object.getPrototypeOf(s3));
  
  /**
   *
   * @param {object} opts
   * @param {string} opts.s3_bucket_name
   * @param {string} opts.s3_key
   * @returns {Promise.<buffer, Error>}
   */
  S3_wrapper.prototype.getObject = function (opts) {

    var schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['s3_bucket_name', 's3_key'],
      properties          : {
        s3_bucket_name: {
          type     : 'string',
          minLength: 1
        },
        s3_key        : {
          type     : 'string',
          minLength: 1
        }
      }
    };

    var valid = ajv.validate(schema, opts);

    if (!valid) {
      var e = new Error(ajv.errorsText());
      e.ajv = ajv.errors;
      throw e;
    }

    return s3.getObjectAsync({
        Bucket: opts.s3_bucket_name,
        Key   : opts.s3_key
      })
      .then(function (data) {
        return data.Body;
      });
  };
};