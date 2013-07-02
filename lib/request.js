var request = require('request');

exports.authed_request = function(username, password, domain) {

    var options = {
      headers: {
        Domain: domain,
        Authorization: "Basic " + new Buffer(username + ':' + password).toString('base64')
      },
      qs: {}
    }
  
    return request.defaults(options);
  }