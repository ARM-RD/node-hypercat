
var _ = require("underscore");
var Base = require("./Base");
var Resource = require("./Resource");
var util = require("util");

function Hypercat (description) {
  Base.call(this);
  this._items = {};
  this.setContentType("application/vnd.tsbiot.catalogue+json");
  this.setDescription(description);
}

util.inherits(Hypercat, Base);

Hypercat.prototype.toJSON = function(asChild) {
  var catalog = {}
  if(asChild) {
    catalog.href=this.href();
    catalog["i-object-metadata"] = this.metadataAsRelVal();
  } else {
    catalog["item-metadata"] = this.metadataAsRelVal();
    catalog.items = this.items().map(function(i){ return i.toJSON.bind(i)(true) });
  }
  return catalog;
}


Hypercat.prototype.merge = function(other) {

  Base.merge.call(this, other);

  var items = other.items();
  items.map(function(item){
    // todo: merge item relations?
    this.addItem(item, item.href());
  }.bind(this));
}


Hypercat.prototype.addItem = function(child, href) {
  child.setHref(href);
  this._items[href] = child;
  return this;
}

Hypercat.prototype.items = function() {
  var items = [];
  for (href in this._items) {
    if (this._items.hasOwnProperty(href)){
      items.push(this._items[href]);
    }
  }
  return items;
}

Hypercat.prototype.item = function(href) {
  // todo clever URL matching
  return this._items[href];
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
  hypercat.metadata = {};
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

Hypercat.get = function(location, key, callback) {
  if (!callback) { callback = key; key = undefined }
  if (!callback) throw new Error('callback required');
  
  var headers = undefined;
  if (key) headers = {
    Authorization: "Basic " + (new Buffer(key+":").toString('base64'))
  }
  
  var req = require("request").get({uri:location, headers:headers}, function (err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) return callback(new Error("Unexpected response code" + response.statusCode));

    var json = {};
    try {
      json = JSON.parse(body);
    } catch (err) {
      return callback(err);
    }
    return callback(false, Hypercat.fromJSON(json))
  });
  
  req.on('error', function(err) {
    // error is handled in the request above
  });
}

module.exports = Hypercat;
