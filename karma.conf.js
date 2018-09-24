// Karma configuration
// Generated on Fri Dec 16 2016 13:09:51 GMT+0000 (UTC)

module.exports = function (config) {
	config.set({

		// Base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// Frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'chai'],

		// List of files / patterns to load in the browser
		files: [
			'dist/debug.js',
			'dist/test.js'
		],

		// List of files to exclude
		exclude: [
			'src/node.js'
		],

		// Preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
		},

		// Test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],

		// Web server port
		port: 9876,

		// Enable / disable colors in the output (reporters and logs)
		colors: true,

		// Level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['HeadlessChrome'],
                  customLaunchers: {
                    HeadlessChrome: {
                      base: 'ChromeHeadless',
                      flags: ['--no-sandbox',],
                       },
                      },

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: false,

		// Concurrency level
		// how many browser should be started simultaneous
		concurrency: Infinity
	});
};
