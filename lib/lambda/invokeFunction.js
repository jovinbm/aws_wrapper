const BPromise = require('bluebird');
const AWS      = require('aws-sdk');
const lambda   = new AWS.Lambda();
const ajv      = require('ajv')({
  removeAdditional: false
});

BPromise.promisifyAll(Object.getPrototypeOf(lambda), {suffix: 'AAsync'});

module.exports = function (LambdaWrapper) {
  
  /**
   *
   * @param {Object} opts
   * @param {String} opts.function_name
   * @param {Object} opts.data
   * @returns {*}
   */
  LambdaWrapper.prototype.invokeFunction = function (opts) {
    
    const schema = {
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
    
    const valid = ajv.validate(schema, opts);
    
    if (!valid) {
      const e = new Error(ajv.errorsText());
      
      e.ajv = ajv.errors;
      throw e;
    }
    
    return BPromise.resolve()
      .then(function () {
        
        return lambda.invokeAAsync({
          FunctionName: opts.function_name,
          Payload     : JSON.stringify(opts.data)
        });
        
      })
      .then(function (response) {
        
        if (!response || !response.Payload) {
          
          const e = new Error('Amazon lambda failed on function');
          
          e.response = response;
          throw e;
        }
        
        return JSON.parse(response.Payload);
      });
  };
  
};