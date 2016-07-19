// DEBUG=* node example/domain
// DEBUG=domain:* node example/domain
// DEBUG=domain:a node example/domain
// DEBUG=domain:b node example/domain


var Debug = require('../');
var domain = require('domain');

/**
 * Starting a winston instance
 */
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
		new (winston.transports.Console)({
			level: 'debug',
			colorize: true,
			handleExceptions: true,
			humanReadableUnhandledException: true
		}),
    ]
});

var a = Debug('domain:a');
a('Logging with default logger.');

/**
 * Bootstrapping winston as the domain logger
 */
var d = domain.create();
d.logger = logger;

/**
 * Starting the domain execution
 */
d.run(function() {
   var b = Debug('domain:b');
   b('Logging in a domain context.') 
});
