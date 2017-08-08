var debug = require('../../')

debug.enable('*')

for (var i=0; i < debug.colors.length; i++) {
  debug('example:' + i)('The color is %o', debug.colors[i])
}
