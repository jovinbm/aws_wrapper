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
   * @param {string} [opts.acl=public-read]
   * @returns {*}
   */
  S3Wrapper.prototype.ensureBucket = function (opts) {
    
    const schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['s3_bucket_name'],
      properties          : {
        s3_bucket_name: {
          type     : 'string',
          minLength: 1
        },
        acl           : {
          type: 'string',
          enum: ['private', 'public-read', 'public-read-write', 'authenticated-read']
        },
        CacheControl  : {
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
    
    const params = {
      Bucket: opts.s3_bucket_name
    };
    
    const createBucket = () => {
      
      return s3.createBucketAsync({
        Bucket: params.Bucket,
        ACL   : opts.acl || 'public-read'
      });
      
    };
    
    return s3.headBucketAsync(params)
      .catch(function (e) {
        
        if (e.code === 'NotFound') { // code returned be aws if bucket is not found
          
          return createBucket();
          
        }
        else {
          
          throw e;
          
        }
        
      });
  };
};