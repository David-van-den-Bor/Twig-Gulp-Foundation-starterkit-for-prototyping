// As you can see the ftpconfig.js is written as a separate module and is imported on to the gulpfile.js and fed into vinyl ftp create method.

// The reason I seperated this into two files is because I did not want to commit my ftp credentials to the project repository. Instead i made a copy of the config file, named it “ftpconfig.js.sample” and committed that to the repo. Also added the ftpconfig.js to my git ignore file. So, team-wise, only I have the ftp credentials to upload files to the server. Clean and secure.

var gutil = require('gulp-util');
  var config = {
    host:     'ftp.yoursite.com',
    user:     'username',
    password: 'password',
    parallel: 10,
    log: gutil.log
    //timeOffset: Offset server time by this number of minutes, default is 0
    //log: gutil.log  //var gutil = require( 'gulp-util' );
  };


module.exports = config;


