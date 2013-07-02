
var _ = require('underscore');
var core = require('h5.linkformat');

exports.JSON = 'application/json'
exports.LINK_FORMAT = 'application/link-format'
exports.URI_LIST = 'text/url-list;sep=true'

exports.parse = function(body, type){
  if(type == exports.URI_LIST)
    return _.compact(body.split('\n'));
  else if (type == exports.LINK_FORMAT) {
    return core.parse(body, { allowMultiple: true, coerce: true });
  }
  else if (type == exports.JSON)
    return JSON.parse(body);
}