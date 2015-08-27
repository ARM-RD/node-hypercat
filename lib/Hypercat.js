
var _ = require("underscore");
var Base = require("./Base");
var Resource = require("./Resource");
var util = require("util");
var url = require("url");

function Hypercat (description) {
  Base.call(this);
  this._items = {};
  this.setContentType("application/vnd.hypercat.catalogue+json");
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


Hypercat.prototype.subcatalogs = function() {
  return this.items(function(item) {
    return item.contentType() == "application/vnd.hypercat.catalogue+json";
  });
}


Hypercat.prototype.addItem = function(child, href) {
  child.setHref(href);
  this._items[href] = child;
  return this;
}

Hypercat.prototype.items = function(filter) {
  if (!filter) filter = function(){return true};
  var items = [];
  for (href in this._items) {
    if (this._items.hasOwnProperty(href)){
      if (filter(this._items[href]))
        items.push(this._items[href]);
    }
  }
  return items;
}

Hypercat.prototype.filter = function(filter) {
  for (href in this._items) {
    if (this._items.hasOwnProperty(href)){
      if (!filter(this._items[href]))
        delete this._items[href];
    }
  }
  return this;
}


Hypercat.prototype.relationFilter = function(relations) {
  if (!Array.isArray(relations)) relations = [relations];
  return function(item) {
    // todo: recurse into catalogs
    for (var i = 0; i < relations.length; i++) {
      if (item.metadata.hasOwnProperty(relations[i])) return true;
    }
    return false;
  }
}

Hypercat.prototype.relationValueFilter = function(filters) {

  function testPredicate(relation, value, item){
    return (item.metadata.hasOwnProperty(relation) && 
           ((!value || (value.length == 0)) || (item.metadata[relation].indexOf(value) != -1)));
  }

  function applyDisjunction(filters, item) {
    var results = _.map(filters, function(value, relation){
      if (!filters.hasOwnProperty(relation)) return true;
      else return testPredicate(relation, value, item);
    })
    return _.some(results);
  }


  if (!Array.isArray(filters)) filters = [filters];
  return function(item) {
    var results = filters.map(function(filter) {
      return applyDisjunction(filter, item);
    });
    return _.some(results);
  }
}

Hypercat.prototype.relations = function() {
  var rels = Base.prototype.relations.call(this);
  this.items().map(function(item) {
    rels = _.union(rels, item.relations());
  });
  return rels;
}

Hypercat.prototype.item = function(href) {
  // todo clever URL matching
  return this._items[href];
}

Hypercat.prototype.supportsSimpleSearch = function(support) {
  this.addRelation("urn:X-hypercat:rels:supportsSearch", "urn:X-hypercat:search:simple");
  return this;
}

Hypercat.prototype.setHomepage = function(url) {
  this.addRelation("urn:X-hypercat:rels:hasHomepage", url);
  return this;
}

Hypercat.prototype.containsContentType = function(contentType){
  this.addRelation("urn:X-hypercat:rels:containsContentType", contentType);
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

function authHeader(key) {
  return {
    Authorization: "Basic " + (new Buffer(key+":").toString('base64')),
    "x-api-key": key
  };
}

Hypercat.get = function(location, key, callback) {
  if (!callback) { callback = key; key = undefined }
  if (!callback) throw new Error('callback required');
  
  var headers = undefined;
  if (key) headers = authHeader(key);
  
  var req = require("request").get({uri:location, headers:headers}, function (err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) return callback(new Error("Unexpected response code " + response.statusCode));

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

Hypercat.prototype.post = function(location, key, callback) {
  if (!callback) { callback = key; key = undefined }
  if (!callback) throw new Error('callback required');
  
  var headers = undefined;
  if (key) headers = authHeader(key);
  
  var req = require("request").post({
    uri:location,
    headers:headers,
    json: this.toJSON()
  }, function (err, response, body) {
    // todo: check resposne code, validate body
    if (err) return callback(err);
    else callback();
  });
}

Hypercat.prototype.put = function(location, key, callback) {
  if (!callback) { callback = key; key = undefined }
  if (!callback) throw new Error('callback required');
  
  var headers = undefined;
  if (key) headers = authHeader(key);
  
  var req = require("request").put({
    uri:location,
    headers:headers,
    json: this.toJSON()
  }, function (err, response, body) {
    // todo: check resposne code, validate body
    if (err) return callback(err);
    else callback();
  });
}

Hypercat.prototype.del = function(location, key, callback) {
  if (!callback) { callback = key; key = undefined }
  if (!callback) throw new Error('callback required');
  
  var headers = undefined;
  if (key) headers = authHeader(key);
  
  var req = require("request").del({
    uri:location,
    headers:headers
  }, function (err, response, body) {
    // todo: check resposne code, validate body
    if (err) return callback(err);
    else callback();
  });
}

module.exports = Hypercat;
