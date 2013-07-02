
var endpointSelector = require('./endpoint');
var actions = require('./actions');

exports = module.exports = function(nspUrl, auth, options){
  
  var domain = function(name){
    var domainUrl = nspUrl + 'xri/@' + name;
    var instance = endpointSelector(domainUrl, auth);
    instance.destroy = actions.destroy(auth, domainUrl);
    return instance;
  }
  
  return {
    domain: domain,
    
    list: actions.list(auth, nspUrl + 'xri/'),
    
    create: function(name, params, callback) {
      var url = nspUrl + 'xri/@'+name;
      if (!params || Array.isArray(params)) params = {}
      auth.post({uri:url, qs:params}, function (err, response, body) {
        if (err) return callback(new Error(err))
        if (response.statusCode == 200 || response.statusCode == 204) {
          callback(false);
        } else {
          return callback(new Error('creation failed').code(response.errorCode));
        }
      })
    }
  };
};

