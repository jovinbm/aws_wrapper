module.exports = function (_aws) {
  
  var path     = require('path');
  var fs       = require('fs');
  var fileName = path.basename(__filename);

  /**
   *
   * @constructor
   */
  function Lambda_wrapper() {
    this.name = 'Lambda_wrapper';
  }
  
  var normalizedPath = path.join(__dirname);
  var excludeFiles   = [fileName];
  fs.readdirSync(normalizedPath).forEach(function (fileNameWithExt) {
    if (excludeFiles.indexOf(fileNameWithExt) > -1) {
      return true;
    }
    if (fs.statSync(path.join(normalizedPath, fileNameWithExt)).isFile()) {
      require("./" + fileNameWithExt)(Lambda_wrapper);
    }
    else {
      require("./" + fileNameWithExt + '/index.js')(Lambda_wrapper);
    }
    
  });
  
  _aws.prototype.Lambda_wrapper = new Lambda_wrapper();
};