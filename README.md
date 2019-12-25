# Debug [![Build Status](https://img.shields.io/travis/visionmedia/debug/master?style=for-the-badge)](https://travis-ci.org/visionmedia/debug) [![Coverage Status](https://img.shields.io/coveralls/github/visionmedia/debug/master?style=for-the-badge)](https://coveralls.io/github/visionmedia/debug?branch=master)

A tiny JavaScript debugging utility modelled after Node.js core's debugging technique. Works cross-platform in NodeJS and browsers.

## Installation

```sh
npm install debug
```

## Basic usage

Debug exports a function which can be provided with the name of your package. The function it returns is essentially a decorated version of console.error which you can pass debug statements to.

This allows you to toggle the debug output for different parts of your module as well as the module as a whole.

```js
const debug = require('debug')('http')

const express = require('express')
const name = 'My App'
const app = express()

debug(`Booting ${name}...`)

app.get('/', (req, res) => {
	debug(`${app} called!`)
	res.send('Hello World!')
})

app.listen(8080, () => debug(`${name} listening on port ${port}!`))

require('./worker')
```

Example worker:

```js
const a = require('debug')('worker:a')
const b = require('debug')('worker:b')

function work() {
	a('doing lots of uninteresting work')
	setTimeout(work, Math.random() * 1000)
}

work()

function workb() {
	b('doing some work')
	setTimeout(workb, Math.random() * 2000)
}

workb()
```

The `DEBUG` environment variable is then used to enable these based on space or comma-delimited names or a wildcard:

<img width="647" alt="Example terminal" src="https://user-images.githubusercontent.com/71256/29091486-fa38524c-7c37-11e7-895f-e7ec8e1039b6.png">

## API

### debug(namespace)

#### namespace

Type: `string`

The name for `debug` to identify itself as.

### debug.formatters

Type: `object`

An object of [printf-style](https://wikipedia.org/wiki/Printf_format_string) formatters which debug uses.

Officially supported formatters:

| Formatter | Representation |
|-----------|----------------|
| `%O`      | Pretty-print an Object on multiple lines. |
| `%o`      | Pretty-print an Object all on a single line. |
| `%s`      | String. |
| `%d`      | Number (both integer and float). |
| `%j`      | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
| `%%`      | Single percent sign ('%'). This does not consume an argument. |

You can add your own custom formatters by extending it. For example, if you wanted to add support for rendering a Buffer as hex with `%h`, you could do something like:

```js
const createDebug = require('debug')
createDebug.formatters.h = (v) => {
  return v.toString('hex')
}
```

Elsewhere in your code, you can do:

```js
const debug = createDebug('foo')
debug('this is hex: %h', new Buffer('hello world'))
//=>  foo this is hex: 68656c6c6f20776f726c6421 +0ms
```

### Instance of `debug`

#### namespace

Type: `string`

The namespace that was specified in the initialiser function.

#### enabled

Type: `boolean`
Default: (`true` when enable via environmental variable)

Log debug messages.

#### useColors

Type: `boolean`\
Default: (`true` when supported)

Use colors in the log messages.

#### color

Type: `number`\
Default: (If `useColors` is `true`, default to a random colour)

The color to use in the log messages.

#### destroy()

Remove the debug function and allow it to be garbage-collected.

#### extend(namespace, deliminer?)

Extend the current namespace by appending it with another.

##### namespace

Type: `string`

The namespace to extend it by.

##### deliminer

Type: `string`\
Default: `:`

The deliminer to use for extending the namespace.

#### inspectOpts (NodeJS only)

Type: `object`

##### colors

Type: `number`

An array of colors which can be used in ANSI escape codes.

##### hideDate

Type: `boolean`

Hide the date when not using colors.

#### diff

Type: `number`

The difference in milliseconds since the last debug message.

#### prev

Type: `number`

The timestamp on which the previous debug message was logged.

#### curr

Type: `number`

The timestamp on which the current debug message was logged.

## Extra information

### Environment Variables

When running `debug` in NodeJS, you can set a few environment variables that can change the behavior of the debug logging:

| Name      | Purpose                                         |
|-----------|-------------------------------------------------|
| `DEBUG`   | Enables/disables specific debugging namespaces. |
| `DEBUG_HIDE_DATE` | Hide date from debug output (non-TTY).  |
| `DEBUG_COLORS`| Whether or not to use colors in the debug output. |
| `DEBUG_DEPTH` | Object inspection depth.                    |
| `DEBUG_SHOW_HIDDEN` | Shows hidden properties on inspected objects. |


__Note:__ The environment variables that begin with `DEBUG_` end up being
converted into an Options object that is used with `%o`/`%O` formatters.

See the [`util.inspect()`](https://nodejs.org/api/util.html#util_util_inspect_object_options) NodeJS documentation for the complete list.

### Conventions

If you're using this in one or more of your libraries, you _should_ use the name of your library so that developers can toggle debugging as desired without guessing names. If you have more than one debugger you _should_ prefix them with your library name and use `:` to separate features. For example, `bodyParser` from `Connect` would then be `connect:bodyParser`.  If you append a `*` to the end of your name, it will always be enabled regardless of how the DEBUG environment variable is set. You can then use it for normal output as well as debug output.

### Wildcards

The `*` character may be used as a wildcard. Suppose for example your library has
debuggers named `connect:bodyParser`, `connect:compress` and `connect:session`.

Instead of listing all three with `DEBUG=connect:bodyParser,connect:compress,connect:session`, you can simply use `DEBUG=connect:*` and to run everything using this module, you can use `DEBUG=*`.

You can also exclude specific debuggers by prefixing them with a `-` character. For example, `DEBUG=*,-connect:*` would include all debuggers except those starting with "connect:".

### Windows command prompt

#### CMD

On Windows, the environment variable is set using the `set` command.

```cmd
set DEBUG=*,-not_this
```

Example:

```cmd
set DEBUG=* & node app.js
```

#### PowerShell (VS Code default)

PowerShell uses a different syntax to set environment variables.

```cmd
$env:DEBUG = "*,-not_this"
```

For example:

```cmd
$env:DEBUG='app';node app.js
```

Then, you can run the program to be debugged as usual.

NPM script example:
```json
{
	"scripts": {
		"windowsDebug": "@powershell -Command $env:DEBUG='*';node app.js"
	}
} 
```

## Authors

[![TJ Holowaychuk](https://github.com/tj.png?size=100)](https://github.com/tj) | [![Nathan Rajlich](https://github.com/tootallnate.png?size=100)](https://github.com/tootallnate) | [![Andrew Rhyne](https://github.com/thebigredgeek.png?size=100)](https://github.com/thebigredgeek)
---|---|---|---|---
TJ Holowaychuk | Nathan Rajlich | Andrew Rhyne

## Backers

Support us with a monthly donation and help us continue our activities. [[Become a backer](https://opencollective.com/debug#backer)]

<a href="https://opencollective.com/debug/backer/0/website" target="_blank"><img src="https://opencollective.com/debug/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/1/website" target="_blank"><img src="https://opencollective.com/debug/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/2/website" target="_blank"><img src="https://opencollective.com/debug/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/3/website" target="_blank"><img src="https://opencollective.com/debug/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/4/website" target="_blank"><img src="https://opencollective.com/debug/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/5/website" target="_blank"><img src="https://opencollective.com/debug/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/6/website" target="_blank"><img src="https://opencollective.com/debug/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/7/website" target="_blank"><img src="https://opencollective.com/debug/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/8/website" target="_blank"><img src="https://opencollective.com/debug/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/9/website" target="_blank"><img src="https://opencollective.com/debug/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/10/website" target="_blank"><img src="https://opencollective.com/debug/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/11/website" target="_blank"><img src="https://opencollective.com/debug/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/12/website" target="_blank"><img src="https://opencollective.com/debug/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/13/website" target="_blank"><img src="https://opencollective.com/debug/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/14/website" target="_blank"><img src="https://opencollective.com/debug/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/15/website" target="_blank"><img src="https://opencollective.com/debug/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/16/website" target="_blank"><img src="https://opencollective.com/debug/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/17/website" target="_blank"><img src="https://opencollective.com/debug/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/18/website" target="_blank"><img src="https://opencollective.com/debug/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/19/website" target="_blank"><img src="https://opencollective.com/debug/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/20/website" target="_blank"><img src="https://opencollective.com/debug/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/21/website" target="_blank"><img src="https://opencollective.com/debug/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/22/website" target="_blank"><img src="https://opencollective.com/debug/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/23/website" target="_blank"><img src="https://opencollective.com/debug/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/24/website" target="_blank"><img src="https://opencollective.com/debug/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/25/website" target="_blank"><img src="https://opencollective.com/debug/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/26/website" target="_blank"><img src="https://opencollective.com/debug/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/27/website" target="_blank"><img src="https://opencollective.com/debug/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/28/website" target="_blank"><img src="https://opencollective.com/debug/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/debug/backer/29/website" target="_blank"><img src="https://opencollective.com/debug/backer/29/avatar.svg"></a>


## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site. [[Become a sponsor](https://opencollective.com/debug#sponsor)]

<a href="https://opencollective.com/debug/sponsor/0/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/1/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/2/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/3/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/4/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/5/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/6/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/7/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/8/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/9/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/10/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/11/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/12/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/13/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/14/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/15/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/16/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/17/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/18/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/19/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/20/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/21/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/22/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/23/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/24/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/25/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/26/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/27/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/28/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/debug/sponsor/29/website" target="_blank"><img src="https://opencollective.com/debug/sponsor/29/avatar.svg"></a>

## License

(The MIT License)

Copyright (c) 2014-2019 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

> README rewrite by [@Richienb](https://github.com/Richienb)
