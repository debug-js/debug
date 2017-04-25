var debug = require('../')
  , initLog = debug('init')
  , requestLog = debug('req')
  , http = require('http')
  , name = 'My App';

// fake app

initLog('booting %s', name);

// You can define the key where you wan't to look for your debug info.
// By default we use DEBUG, but you can use a custom one in case DEBUG
// variable is being used for something else.
// With the example below, you can set CUSTOM_FLAG with namespaces,
// CUSTOM_FLAG_FD for File Descriptor, and CUSTOM_FLAG_COLORS for colors.
// Play a little bit by setting those vars with different values.
// 
// NOTE: The setting change will start working after it's run. So the log for
// booting will depend on what you have on DEBUG var, because it's before
// settings update.
debug.settings({ envVarName: 'CUSTOM_FLAG' });

http.createServer(function(req, res){
  requestLog(req.method + ' ' + req.url);
  res.end('hello\n');
}).listen(3000, function(){
  initLog('listening on port 3000');
});

// fake worker of some kind

require('./worker');