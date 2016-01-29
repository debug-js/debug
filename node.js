/**
 * Module dependencies.
 */

var tty = require('tty'),
    util = require('util'),
    colors = require('colors'),
    moment = require('moment');

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.stylize = stylize;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;
var stream = 1 === fd ? process.stdout :
    2 === fd ? process.stderr :
    createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
    var debugColors = (process.env.DEBUG_COLORS || '').trim().toLowerCase();
    if (0 === debugColors.length) {
        return tty.isatty(fd);
    } else {
        return '0' !== debugColors && 'no' !== debugColors && 'false' !== debugColors && 'disabled' !== debugColors;
    }
}

/**
 * Map %o to `util.inspect()`, since Node doesn't do that out of the box.
 */

var inspect = (4 === util.inspect.length ?
    // node <= 0.8.x
    function(v, colors) {
        return util.inspect(v, void 0, void 0, colors);
    } :
    // node > 0.8.x
    function(v, colors) {
        return util.inspect(v, {
            colors: colors
        });
    }
);

function stylize(str, color) {
    if (typeof color === 'string') {
        color = color.split('.');
    }
    var chooser = colors;
    color.forEach(function(d) {
        chooser = chooser[d];
    });
    return this.useColors ? chooser(str) : str;
}

var customTypeOf = function(inp) {
    if (moment.utc(inp, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid())
        return "ISOStringDate";
    else if (inp instanceof Date)
        return "JSDate";
    else if (inp instanceof moment().__proto__.constructor)
        return "momentJSDate";
    else if (Array.isArray(inp))
        return "array";
    else if (inp === void 0)
        return "void0";
    else if (inp === null)
        return "null";
    else {
        return typeof inp;
    }
};

function objectFormatter(obj, spaceString, nSpaces) {
    if (!nSpaces)
        nSpaces = 0;
    if (!spaceString)
        spaceString = " ";
    var currentSpaces = "";
    for (var i = 0; i < nSpaces; i++)
        currentSpaces += spaceString;
    var type = " [" + customTypeOf(obj) + "]";
    var out = "";
    if (obj != void 0 && obj.toISOString != void 0) {
        out += obj.toISOString() + type;
        return out;
    } else if (!(typeof obj === 'object')) { //string, number...
        out += obj + type;
        return out;
    }
    nSpaces++;
    if (nSpaces > 1)
        out += type;
    var kString;
    for (var k in obj) {
        out += "\n";
        type = customTypeOf(obj[k]);
        kString = k;
        if (type == "number")
            kString = this.stylize(k, "blue");
        else if (type == "array")
            kString = this.stylize(k, "underline");
        else if (type == "object")
            kString = this.stylize(k, "bold");
        else if (type == "string")
            kString = this.stylize(k, "yellow");
        else if (type == "ISOStringDate" || type == "momentJSDate" || type == "JSDate")
            kString = this.stylize(k, "cyan");
        else if (type == "void0" || type == "null")
            kString = this.stylize(k, "red");
        out += currentSpaces + kString + " : " + objectFormatter.apply(this, [obj[k], spaceString, nSpaces]);
    }
    return out;
};

exports.formatters.o = function(v) {
    return objectFormatter.apply(this, [v, '', 2]);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs() {
    var args = arguments;
    var useColors = this.useColors;
    var name = this.namespace;

    if (useColors) {
        var c = this.color;

        args[0] = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m' + args[0] + '\u001b[3' + c + 'm' + ' +' + exports.humanize(this.diff) + '\u001b[0m';
    } else {
        args[0] = new Date().toUTCString() + ' ' + name + ' ' + args[0];
    }
    return args;
}

/**
 * Invokes `console.error()` with the specified arguments.
 */

function log() {
    return stream.write(util.format.apply(this, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
    if (null == namespaces) {
        // If you set a process.env field to null or undefined, it gets cast to the
        // string 'null' or 'undefined'. Just delete instead.
        delete process.env.DEBUG;
    } else {
        process.env.DEBUG = namespaces;
    }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
    return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream(fd) {
    var stream;
    var tty_wrap = process.binding('tty_wrap');

    // Note stream._type is used for test-module-load-list.js

    switch (tty_wrap.guessHandleType(fd)) {
        case 'TTY':
            stream = new tty.WriteStream(fd);
            stream._type = 'tty';

            // Hack to have stream not keep the event loop alive.
            // See https://github.com/joyent/node/issues/1726
            if (stream._handle && stream._handle.unref) {
                stream._handle.unref();
            }
            break;

        case 'FILE':
            var fs = require('fs');
            stream = new fs.SyncWriteStream(fd, {
                autoClose: false
            });
            stream._type = 'fs';
            break;

        case 'PIPE':
        case 'TCP':
            var net = require('net');
            stream = new net.Socket({
                fd: fd,
                readable: false,
                writable: true
            });

            // FIXME Should probably have an option in net.Socket to create a
            // stream from an existing fd which is writable only. But for now
            // we'll just add this hack and set the `readable` member to false.
            // Test: ./node test/fixtures/echo.js < /etc/passwd
            stream.readable = false;
            stream.read = null;
            stream._type = 'pipe';

            // FIXME Hack to have stream not keep the event loop alive.
            // See https://github.com/joyent/node/issues/1726
            if (stream._handle && stream._handle.unref) {
                stream._handle.unref();
            }
            break;

        default:
            // Probably an error on in uv_guess_handle()
            throw new Error('Implement me. Unknown stream file type!');
    }

    // For supporting legacy API we put the FD here.
    stream.fd = fd;

    stream._isStdio = true;

    return stream;
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());
