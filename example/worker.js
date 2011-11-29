
var debug = require('../')('worker');

setInterval(function(){
  debug('doing some work');
}, 1000);