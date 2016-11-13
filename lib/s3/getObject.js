const BPromise = require('bluebird');
const AWS     = require('aws-sdk');
const s3      = new AWS.S3();
const ajv     = require('ajv')({
  removeAdditional: false
});

BPromise.promisifyAll(Object.getPrototypeOf(s3));

module.exports = function (S3Wrapper) {
  
  /**
   *
   * @param {object} opts
   * @param {string} opts.s3_bucket_name
   * @param {string} opts.s3_key
   * @returns {Promise.<buffer, Error>}
   */
  S3Wrapper.prototype.getObject = function (opts) {
    
    const schema = {
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
    
    const valid = ajv.validate(schema, opts);
    
    if (!valid) {
      const e = new Error(ajv.errorsText());
      
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