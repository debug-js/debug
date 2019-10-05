/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */
import node = require("node");
import browser = require("browser");
type isBrowser=typeof window;
type index=isBrowser extends Object?  typeof browser:  typeof node;
export=index;
