const debug = require('../../src'); // ../../src can be replaced with debug if run outside of this repository

const a = debug('worker:a');
const b = debug('worker:b');

function worka() {
	a('doing lots of uninteresting work');
	setTimeout(worka, Math.random() * 1000);
}

function workb() {
	b('doing some work');
	setTimeout(workb, Math.random() * 2000);
}

module.exports = {worka, workb};
