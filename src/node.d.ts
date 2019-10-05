/**
 * Module dependencies.
 */
import TTY=require("tty");
import Util=require("util");

declare const tty: typeof TTY;
declare const util: typeof Util;
/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */
declare function useColors(): boolean;
/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */
declare function formatArgs(args: any): void;
declare function getDate(): string;
/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */
declare function log(...args: any[]): boolean;
/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
declare function save(namespaces: string): void;
/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
declare function load(): string;
/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */
declare function init(debug: any): void;
declare const formatters: {o:()=>string,O:()=>string};
