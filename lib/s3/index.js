module.exports = function (Aws_wrapper) {
  
  var path     = require('path');
  var fs       = require('fs');
  var fileName = path.basename(__filename);

  /**
   *
   * @constructor
   */
  function S3_wrapper() {
    this.name = 'S3_wrapper';
  }
  
  var normalizedPath = path.join(__dirname);
  var excludeFiles   = [fileName];
  fs.readdirSync(normalizedPath).forEach(function (fileNameWithExt) {
    if (excludeFiles.indexOf(fileNameWithExt) > -1) {
      return true;
    }
    if (fs.statSync(path.join(normalizedPath, fileNameWithExt)).isFile()) {
      require("./" + fileNameWithExt)(S3_wrapper);
    }
    else {
      require("./" + fileNameWithExt + '/index.js')(S3_wrapper);
    }

  });
  
  Aws_wrapper.prototype.S3_wrapper = new S3_wrapper();
};