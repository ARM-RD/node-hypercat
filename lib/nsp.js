var domain = require('./domain');
var request = require('./request');
var utils = require('./utils');

var defaults = {
    address: '',
    port: 8080,
    protocol: 'http'
}

exports = module.exports = function(options){
  var completeOptions = utils.merge_options(defaults, options);
  
  if (!completeOptions.address || completeOptions.address.length == 0)
    throw new Error('nsp address not set');
  var url = utils.nsp_base_address(completeOptions);
  
  var nsp = {
    options : completeOptions,
    auth : function(username, password, domain_name) {
      var auth = request.authed_request(username, password, domain_name);
      return domain(url, auth);
    }
  }
  return nsp;
};

Error.prototype.code = function(val) {
  if (val) {
    this.errorCode = val;
    return this;
  } else {
    return this.errorCode ? this.errorCode : 500;
  }
}