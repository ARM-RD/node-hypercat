var actions = require('./actions');

exports = module.exports = function(endpointUrl, auth, options){
  
  var resource = function(path){
    var endpointUrl = endpointUrl + '/' + path;
    return {
      get:function(){},
      set:function(){}
    };
  }

  return {
    resource: resource,
    list: actions.list(auth, endpointUrl)
  }
};

