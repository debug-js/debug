// NOTE - run using: DEBUG=example DEBUG_DYN=1 node app.js

var debug = require('../..')
  , express = require('express')
  , bodyParser = require('body-parser')
  , app = express()
  , name = 'example';

var log = debug(name)
log('booting example app');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  log(req.method + ' ' + req.url);
  next();
});

app.get('/', function (req, res) {
  log('sending form');
  res.sendFile(__dirname + '/index.html');
});

app.post('/debug', function (req, res) {
  if ('enable' in req.body) {
    log('enabling');
    debug.enable(name);
  } else {
    log('disabling');
    debug.disable(name);
  }
  res.redirect('/');
});

app.post('/disable', function (req, res) {
  log('disabling');
  debug.disable(name);
  res.redirect('/');
});

app.listen(3000, function () {
  log('listening');
});
