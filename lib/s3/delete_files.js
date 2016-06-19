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
   * @param {string} bucket
   * @param {object[]} keys - an array of s3 keys
   * @returns {Promise.<boolean, Error>}
   */
  S3_wrapper.prototype.deleteFiles = function (bucket, keys) {
    
    var schema = {
      type    : 'array',
      minItems: 1,
      items   : {
        type: 'string'
      }
    };
    
    var valid = ajv.validate(schema, event);
    
    if (!valid) {
      var e = new Error(ajv.errorsText());
      e.ajv = ajv.errors;
      throw e;
    }
    
    var delete_objects = keys.map(function (key) {
      var temp = {};
      temp.Key = key;
      return temp;
    });
    
    var params = {
      Bucket: bucket,
      Delete: {
        Objects: delete_objects
      }
    };
    
    return s3.deleteObjectsAsync(params)
      .then(function () {
        return true;
      })
      .catch(function (e) {
        throw new axpError({
          err  : e,
          print: true
        });
      });
  };
  
};