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
   * @param {string} opts.bucket_name
   * @param {object[]} opts.keys - an array of s3 keys
   * @returns {Promise.<boolean, Error>}
   */
  S3_wrapper.prototype.deleteFiles = function (opts) {
    
    var schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['bucket_name', 'keys'],
      properties          : {
        bucket_name: {
          type     : 'string',
          minLength: 1
        },
        keys       : {
          type    : 'array',
          minItems: 1,
          items   : {
            type: 'string'
          }
        }
      }
    };
    
    var valid = ajv.validate(schema, opts);
    
    if (!valid) {
      var e = new Error(ajv.errorsText());
      e.ajv = ajv.errors;
      throw e;
    }
    
    var delete_objects = opts.keys.map(function (key) {
      var temp = {};
      temp.Key = key;
      return temp;
    });
    
    var params = {
      Bucket: opts.bucket_name,
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