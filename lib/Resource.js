
var _ = require("underscore");
var Base = require("./Base");
var util = require("util");

function Resource (description, contentType) {
  Base.call(this);
  if (!contentType) contentType = 'application/unknown';
  this.setContentType(contentType);
  this.setDescription(description);
}
util.inherits(Resource, Base);

Resource.prototype.toJSON = function(){
  var item = {};
  item.href = this.href();
  item["i-object-metadata"] = this.metadataAsRelVal();
  return item;
}

Resource.fromJSON = function(json) {
  var resource = new Resource();
  resource.metadata = {};
  if (!json.href) throw new Error('missing href');
  if ((!json["i-object-metadata"]) || (!Array.isArray(json["i-object-metadata"])))
    throw new Error('invalid i-object-metadata array');
  
  resource.setHref(json.href);
  
  var metadata = json["i-object-metadata"];
  metadata.map(function(item) {
    if (!item.rel) return null;
    if (!item.val) return null;
    resource.addRelation(item.rel.toString(), item.val.toString())
  });
  
  return resource;
}

module.exports = Resource;
