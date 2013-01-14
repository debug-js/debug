var debug = require('../')('json')

debug('Fetching %s from %s', 'data', 'example.com')

setTimeout(function () {
	debug('Received: %pj', {
		activity: [
			'added a todo',
			'added a todo',
			'marked #1 as complete'
		],
		tasks: [
			{
				title: 'bake a pancake',
				status: 'pending'
			},
			{
				title: 'get eggs',
				status: 'complete'
			}
		]
	})
}, 107)