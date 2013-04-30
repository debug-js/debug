var debug = require('../')('paths')

debug('relative to $PWD: %p', __filename)
debug('$HOME: %p', process.env.HOME)
debug('outside $HOME: %p', process.env.HOME.split('/').slice(0, -1).join('/'))
debug('inside $HOME: %p', process.env.HOME+'/a/folder')
debug('encoded url: %u', encodeURIComponent('http://g.com/example'))
