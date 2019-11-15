type DebugNamespace = {
	(...args: string[]): void;
	namespace: string;
	enabled: boolean;
	useColors: boolean;
	color: number | string;
	destroy: () => boolean;
	extend: (namespace: string, delimiter: string) => DebugNamespace;
};

type DebugType = {
	(namespace: string): DebugNamespace;
	debug: DebugType;
	default: DebugNamespace;
	coerce: <T>(val: T) => T;
	disable: () => string;
	enable: (namespaces: string) => void;
	enabled: (name: string) => boolean;
	humanize: (timeInMs:number)=>string;
	/**
	 * Active `debug` instances.
	 */
	instances: DebugNamespace[];
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	names: string[];
	skips: string[];
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	 */
	formatters: {};
	selectColor: (namespace: string) => number;
};

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

import node = require("node");
import browser = require("browser");
declare function setup(env:typeof node|typeof browser ): DebugType;
