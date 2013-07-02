var resource = require('./resource');
var actions = require('./actions');

exports = module.exports = function(domainUrl, auth, options){
  
  var endpoint = function(name){
    var url = domainUrl + '*' + name;
    return resource(url, auth);
  }

  return {
    endpoint: endpoint,
    list: actions.list(auth, domainUrl)
  };
};

