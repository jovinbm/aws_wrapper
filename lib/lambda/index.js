const path     = require('path');
const fs       = require('fs');
const fileName = path.basename(__filename);

module.exports = function (AwsWrapper) {
  
  /**
   *
   * @constructor
   */
  const LambdaWrapper = function () {
    this.name = 'LambdaWrapper';
  };
  
  const normalized_path = path.join(__dirname);
  const excluded_files  = [fileName];
  
  fs.readdirSync(normalized_path).forEach(file_name_with_ext => {
    if (excluded_files.indexOf(file_name_with_ext) > -1) {
      return true;
    }
    
    if (fs.statSync(path.join(normalized_path, file_name_with_ext)).isFile()) {
      require(`./${file_name_with_ext}`)(LambdaWrapper);
    }
    else {
      require(`./${file_name_with_ext}/index.js`)(LambdaWrapper);
    }
    
    return true;
    
  });
  
  AwsWrapper.prototype.LambdaWrapper = new LambdaWrapper();
};