var debug = require('../')('paths')

debug('relative to $PWD: %p', __filename)
debug('outside $PWD: %p', process.env.HOME)
debug('encoded url: %u', encodeURIComponent('http://g.com/example'))
