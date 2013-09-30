
var _ = require("underscore");
var Base = require("./Base");
var util = require("util");

function Resource (description, contentType) {
  Base.call(this);
  this.setContentType(contentType);
  this.setDescription(description);
}
util.inherits(Resource, Base);

Resource.prototype.toJSON = function(){
  var item = {};
  item.href = this.href();
  item["i-object-metadata"] = this.metadata;
  return item;
}

module.exports = Resource;
