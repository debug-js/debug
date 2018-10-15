// Add by @allex_wang for rollup bundler

import resolveId from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

const {version, name, author, license, dependencies} = require('./package.json');

const banner = (name, short = false) => {
	let s;
	if (short) {
		s = `/*! ${name} v${version} | ${license} licensed | ${author} */`;
	} else {
		s = `/*!
 * ${name} v${version}
 *
 * @author ${author}
 * Released under the ${license} license.
 */`;
	}
	return s;
};

const plugins = [
	resolveId(),
	commonjs(),
	babel({comments: false})
];

export default [
	{
		input: 'src/browser.js',
		plugins,
		external: Object.keys(dependencies), // Dependencies as external in esm dist
		output: [
			{file: 'dist/debug.esm.js', format: 'esm', banner: banner(name)}
		]
	},
	{
		input: 'src/browser.js',
		plugins,
		output: [
			{file: 'dist/debug.js', format: 'umd', name: 'debug', banner: banner(name)}
		]
	}
];

/* Vim: set ft=javascript fdm=marker et ff=unix tw=80 sw=2 ts=2: */
