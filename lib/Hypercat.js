
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

module.exports = Hypercat;
