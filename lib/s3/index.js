const path     = require('path');
const fs       = require('fs');
const fileName = path.basename(__filename);

module.exports = function (AwsWrapper) {
  
  /**
   *
   * @constructor
   */
  const S3Wrapper = function () {
    this.name = 'S3Wrapper';
  };
  
  const normalized_path = path.join(__dirname);
  const excluded_files  = [fileName];
  
  fs.readdirSync(normalized_path).forEach(file_name_with_ext => {
    if (excluded_files.indexOf(file_name_with_ext) > -1) {
      return true;
    }
    
    if (fs.statSync(path.join(normalized_path, file_name_with_ext)).isFile()) {
      require(`./${file_name_with_ext}`)(S3Wrapper);
    }
    else {
      require(`./${file_name_with_ext}/index.js`)(S3Wrapper);
    }
    
    return true;
    
  });
  
  AwsWrapper.prototype.S3Wrapper = new S3Wrapper();
};