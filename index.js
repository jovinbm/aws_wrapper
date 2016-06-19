/**
 * AWS CREDENTIALS SHOULD BE IN ENV VARIABLES
 */

var path = require('path');
var fs   = require('fs');

/**
 *
 * @constructor
 */
var Aws_wrapper = function () {
  this.name = 'XAws';
};

var normalizedPath = path.join(__dirname, 'lib');
fs.readdirSync(normalizedPath).forEach(function (fileNameWithExt) {
  if (fs.statSync(path.join(normalizedPath, fileNameWithExt)).isFile()) {
    require("./" + fileNameWithExt)(Aws_wrapper);
  }
  else {
    require("./" + fileNameWithExt + '/index.js')(Aws_wrapper);
  }

});

exports._aws_wrapper = new Aws_wrapper();