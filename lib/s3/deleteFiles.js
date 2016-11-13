const BPromise = require('bluebird');
const AWS      = require('aws-sdk');
const s3       = new AWS.S3();
const ajv      = require('ajv')({
  removeAdditional: false
});

BPromise.promisifyAll(Object.getPrototypeOf(s3));

module.exports = function (S3Wrapper) {
  
  /**
   *
   * @param {object} opts
   * @param {string} opts.s3_bucket_name
   * @param {object[]} opts.s3_keys - an array of s3 keys
   * @returns {Promise.<boolean, Error>}
   */
  S3Wrapper.prototype.deleteFiles = function (opts) {
    
    const schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['s3_bucket_name', 's3_keys'],
      properties          : {
        s3_bucket_name: {
          type     : 'string',
          minLength: 1
        },
        s3_keys       : {
          type    : 'array',
          minItems: 1,
          items   : {
            type: 'string'
          }
        }
      }
    };
    
    const valid = ajv.validate(schema, opts);
    
    if (!valid) {
      const e = new Error(ajv.errorsText());
      
      e.ajv = ajv.errors;
      throw e;
    }
    
    const delete_objects = opts.s3_keys.map(function (key) {
      const temp = {};
      
      temp.Key = key;
      
      return temp;
    });
    
    const params = {
      Bucket: opts.s3_bucket_name,
      Delete: {
        Objects: delete_objects
      }
    };
    
    return s3.deleteObjectsAsync(params)
      .then(function () {
        return true;
      });
  };
  
};