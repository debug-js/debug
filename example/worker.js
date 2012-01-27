
var a = require('../')('worker a')
  , b = require('../')('worker b');

function work() {
  a('doing some work');
  setTimeout(work, Math.random() * 1000);
}

work();

function workb() {
  b('doing some work');
  setTimeout(workb, Math.random() * 2000);
}

workb();