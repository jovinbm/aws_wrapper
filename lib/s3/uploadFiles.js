const BPromise = require('bluebird');
const fs       = require('fs');
const path     = require('path');
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
   * @param {string} opts.dir - directory containing files to be uploaded
   * @param {string} opts.s3_bucket_name
   * @param {string} opts.s3_output_dir
   * @param {string} [opts.acl=public-read]
   * @param {number|string} [opts.CacheControl=15552000] -- in seconds
   * @returns {*}
   */
  S3Wrapper.prototype.uploadFiles = function (opts) {
    
    const schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['dir', 's3_bucket_name', 's3_output_dir'],
      properties          : {
        dir           : {
          type     : 'string',
          minLength: 1
        },
        s3_bucket_name: {
          type     : 'string',
          minLength: 1
        },
        s3_output_dir : {
          type     : 'string',
          minLength: 1
        },
        acl           : {
          type: 'string',
          enum: ['private', 'public-read', 'public-read-write', 'authenticated-read']
        },
        CacheControl  : {
          type: ['integer']
        }
      }
    };
    
    const valid = ajv.validate(schema, opts);
    
    if (!valid) {
      const e = new Error(ajv.errorsText());
      
      e.ajv = ajv.errors;
      throw e;
    }
    
    opts.acl          = opts.acl || 'public-read';
    opts.CacheControl = opts.CacheControl ? `max-age=${String(opts.CacheControl)}` : 'max-age=15552000';
    
    return BPromise.resolve()
      .then(function () {
        const keys = [];
        
        return fs.readdirAsync(opts.dir)
          .map(function (fileNameWithExt) {
            
            console.log(`Uploading ${path.join(opts.dir, fileNameWithExt)} to ${opts.s3_bucket_name}`);
            
            const params = {
              Bucket      : opts.s3_bucket_name,
              CacheControl: opts.CacheControl,
              Key         : path.join(opts.s3_output_dir, fileNameWithExt),
              ACL         : opts.acl,
              Body        : fs.createReadStream(path.join(opts.dir, fileNameWithExt))
            };
            
            return s3.putObjectAsync(params)
              .then(function () {
                
                keys.push(path.join(opts.s3_output_dir, fileNameWithExt));
                
                return true;
              });
          })
          .then(function () {
            
            return keys;
            
          });
      });
  };
};