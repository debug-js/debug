var debug = require('../');

var error = debug('app:error');
// inspect hidden properties of a single object
error('stdin', error.inspect(new Error('Oh snap'), {showHidden: true}));

var shallow = debug('app:shallow');
// default depth 0 for all formatted objects in this namespace
var debugInspect = shallow.inspect;
shallow.inspect = function(object, options) {
  return debugInspect.call(this, object, Object.assign({depth: 0}, options));
};
shallow('console: %o', console);
