
var debug = require('../')('worker');

function work() {
  debug('doing some work');
  setTimeout(work, Math.random() * 1000);
}

work();