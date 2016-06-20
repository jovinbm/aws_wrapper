module.exports = function (S3_wrapper) {
  
  var Promise = require('bluebird');
  var fs      = require('fs');
  var AWS     = require('aws-sdk');
  var s3      = new AWS.S3();
  var ajv     = require("ajv")({
    removeAdditional: false
  });
  Promise.promisifyAll(Object.getPrototypeOf(s3));
  
  /**
   *
   * @param {object} opts
   * @param {string} opts.dir - directory containing files to be uploaded
   * @param {string} opts.bucket_name
   * @param {string} opts.s3_output_dir
   * @param {string} [opts.acl=public-read]
   * @param {number|string} [opts.CacheControl=15552000] -- in seconds
   * @returns {*}
   */
  S3_wrapper.prototype.uploadFiles = function (opts) {
    
    var schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['dir', 'bucket_name', 's3_output_dir'],
      properties          : {
        dir          : {
          type     : 'string',
          minLength: 1
        },
        bucket_name  : {
          type     : 'string',
          minLength: 1
        },
        s3_output_dir: {
          type     : 'string',
          minLength: 1
        },
        acl          : {
          type: 'string',
          enum: ['private', 'public-read', 'public-read-write', 'authenticated-read']
        },
        CacheControl : {
          type: ['integer']
        }
      }
    };
    
    var valid = ajv.validate(schema, opts);
    
    if (!valid) {
      var e = new Error(ajv.errorsText());
      e.ajv = ajv.errors;
      throw e;
    }
    opts.acl          = opts.acl || 'public-read';
    opts.CacheControl = opts.CacheControl ? 'max-age=' + String(opts.CacheControl) : 'max-age=15552000';
    
    return Promise.resolve()
      .then(function () {
        return (new S3_wrapper()).ensureBucket({
          bucket_name: opts.bucket_name,
          acl        : opts.acl
        });
      })
      .then(function () {
        var keys = [];
        
        return fs.readdirAsync(opts.dir).map(function (fileNameWithExt) {
            console.log('Uploading ' + opts.dir + fileNameWithExt + ' to ' + opts.bucket_name);
            var params = {
              Bucket      : opts.bucket_name,
              CacheControl: opts.CacheControl,
              Key         : opts.s3_output_dir + fileNameWithExt,
              ACL         : opts.acl,
              Body        : fs.createReadStream(opts.dir + fileNameWithExt)
            };
            
            return s3.putObjectAsync(params)
              .then(function () {
                keys.push(opts.s3_output_dir + fileNameWithExt);
                return true;
              });
          })
          .then(function () {
            return keys;
          });
      });
  };
};