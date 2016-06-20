/**
 * AWS CREDENTIALS SHOULD BE IN ENV VARIABLES
 */

/**
 *
 * @constructor
 */
var Aws_wrapper = function () {
  this.name = 'XAws';
};

require('./lib/index')(Aws_wrapper);

exports._aws_wrapper = Aws_wrapper;