var utils = require('./utils');
var types = require('./content_types');


exports.list = function(auth, parentUrl) {
  var list = function(params, callback) {
    if (!params || Array.isArray(params)) params = {}
    if (!params['_xrd_r'])
      params['_xrd_r'] = types.URI_LIST;
    
    auth({uri:parentUrl, qs:params}, function (err, response, body) {
      if (err) return callback(new Error(err))
      if (response.statusCode == 200 || response.statusCode == 204) {
        callback(false, types.parse(body, params['_xrd_r']));
      } else {
        return callback(new Error('listing failed').code(response.errorCode));
      }
    })
  }
  
  list.metadata = function(params, callback){
    if (!params || Array.isArray(params)) params = {}
    params['_xrd_r'] = types.LINK_FORMAT;
    list(params, callback);
  }
  
  return list;
}


exports.destroy = function(auth, parentUrl) {
  return function(callback) {
    auth.del(parentUrl, function (err, response, body) {
      if (err) return callback(new Error(err))
      if (response.statusCode == 200 || response.statusCode == 204) {
        callback(false);
      } else {
        return callback(new Error('deletion failed').code(response.errorCode));
      }
    })
  }
}
