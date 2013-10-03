
var _ = require("underscore");
var Base = require("./Base");
var Resource = require("./Resource");
var util = require("util");


function Hypercat (description) {
  Base.call(this);
  this.setContentType("application/vnd.tsbiot.catalogue+json");
  this.setDescription(description);
}

util.inherits(Hypercat, Base);

Hypercat.prototype.toJSON = function(asChild) {
  var catalog = {}
  if(asChild) {
    catalog.href=this.href();
    catalog["i-object-metadata"] = this.metadata;
  } else {
    catalog["item-metadata"] = this.metadata;
    catalog.items = this.items.map(function(i){ return i.toJSON.bind(i)(true) });
  }
  return catalog;
}

Hypercat.prototype.addItem = function(child, href) {
  child.setHref(href);
  this.items.push(child);
  return this;
}

Hypercat.prototype.items = function() {
  return this.items;
}

Hypercat.prototype.supportsSimpleSearch = function(support) {
  this.addRelation("urn:X-tsbiot:rels:supportsSearch", "urn:X-tsbiot:search:simple");
  return this;
}

Hypercat.prototype.setHomepage = function(url) {
  this.addRelation("urn:X-tsbiot:rels:hasHomepage", url);
  return this;
}

Hypercat.prototype.containsContentType = function(contentType){
  this.addRelation("urn:X-tsbiot:rels:containsContentType", contentType);
  return this;
}

Hypercat.fromJSON = function(json) {
  var hypercat = new Hypercat();
  hypercat.metadata = [];
  if ((!json["item-metadata"]) || (!Array.isArray(json["item-metadata"])))
    throw new Error('invalid item-metadata array');
  if ((!json.items) || (!Array.isArray(json.items)))
    throw new Error('invalid items array');
  
  var metadata = json["item-metadata"];
  metadata.map(function(item) {
    if (!item.rel) return null;
    if (!item.val) return null;
    hypercat.addRelation(item.rel.toString(), item.val.toString());
  });
  
  json.items.map(function(item) {
    var validatedItem = Resource.fromJSON(item);
    hypercat.addItem(validatedItem, validatedItem.href());
  });
  
  return hypercat;
}

module.exports = Hypercat;
