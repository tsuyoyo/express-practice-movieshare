
// 0 : error
// 1 : warn
// 2 : info
// 3 : debug
var logLevel = 3;

exports.DEBUG_LOG = function (logMsg) {
 console.log('Debug : ' + logMsg);
};

var logs = function(){

  this.D = function (logMsg) {
    if (3 >= logLevel) {
      console.log('Debug : ' + logMsg);
    }
  };

  this.I = function (logMsg) {
    if (2 >= logLevel) {
      console.log('Debug : ' + logMsg);
    }
  };

  this.W = function (logMsg) {
    if (1 >= logLevel) {
      console.log('Debug : ' + logMsg);
    }
  };

  this.E = function (logMsg) {
    if (0 >= logLevel) {
      console.log('Debug : ' + logMsg);
    }
  }

};

exports.LOG = new logs();
