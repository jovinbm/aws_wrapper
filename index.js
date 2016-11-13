/**
 * AWS CREDENTIALS SHOULD BE IN ENV VARIABLES
 */

/**
 *
 * @constructor
 */
const AwsWrapper = function () {
  this.name = 'AwsWrapper';
};

require('./lib/index')(AwsWrapper);

exports.AwsWrapper = AwsWrapper;