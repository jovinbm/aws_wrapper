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
   * @param {string} [opts.acl=public-read]
   * @returns {*}
   */
  S3_wrapper.prototype.ensureBucket = function (opts) {
    
    var schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['bucket_name'],
      properties          : {
        bucket_name : {
          type     : 'string',
          minLength: 1
        },
        acl         : {
          type: 'string',
          enum: ['private', 'public-read', 'public-read-write', 'authenticated-read']
        },
        CacheControl: {
          type     : 'string',
          minLength: 1
        }
      }
    };
    
    var valid = ajv.validate(schema, event);
    
    if (!valid) {
      var e = new Error(ajv.errorsText());
      e.ajv = ajv.errors;
      throw e;
    }
    
    var params = {
      Bucket: opts.bucket_name
    };
    
    return Promise.resolve()
      .then(function () {
        return s3.headBucketAsync(params)
          .catch(function (e) {
            if (e.code === 'NotFound') { // code returned be aws if bucket is not found
              return s3.createBucketAsync({
                  Bucket: params.Bucket,
                  ACL   : opts.acl || 'public-read'
                })
                .then(function () {
                  return true;
                });
            }

            throw e;
          });
      });
  };
};