module.exports = function (Lambda_wrapper) {
  
  var Promise       = require('bluebird');
  var AWS           = require('aws-sdk');
  AWS.config.region = 'us-east-1';
  var lambda        = new AWS.Lambda();
  var ajv           = require("ajv")({
    removeAdditional: false
  });
  Promise.promisifyAll(Object.getPrototypeOf(lambda), {suffix: 'AAsync'});
  
  /**
   *
   * @param {Object} opts
   * @param {String} opts.function_name
   * @param {Object} opts.data
   * @returns {*}
   */
  Lambda_wrapper.prototype.invokeFunction = function (opts) {
    
    var schema = {
      type                : 'object',
      additionalProperties: false,
      required            : ['function_name', 'data'],
      properties          : {
        function_name: {
          type     : 'string',
          minLength: 1
        },
        data         : {
          type: 'object'
        }
      }
    };
    
    var valid = ajv.validate(schema, opts);
    
    if (!valid) {
      var e = new Error(ajv.errorsText());
      e.ajv = ajv.errors;
      throw e;
    }
    
    return Promise.resolve()
      .then(function () {
        return lambda.invokeAAsync({
          FunctionName: opts.function_name,
          Payload     : JSON.stringify(opts.data)
        });
      })
      .then(function (response) {
        if (!response || !response.Payload) {
          var e      = new Error('Amazon lambda failed on function');
          e.response = response;
          throw e;
        }
        
        return JSON.parse(response.Payload);
      });
  };
  
};