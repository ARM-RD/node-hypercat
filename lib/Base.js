
var _ = require("underscore");

function Base () {
  this.metadata = {};
  this._href = null;
}

Base.prototype.addRelation = function(rel, val) {
  if (!this.metadata[rel]) this.metadata[rel] = [];
  
  if (this.metadata[rel].indexOf(val) == -1)
    this.metadata[rel].push(val);
  
  return this;
}

Base.prototype.removeRelations = function(rel, val) {
  if(!this.metadata[rel]) return;
  
  if ((typeof val == 'undefined') || !val)
    delete this.metadata[rel];
  else {
    var index = this.metadata[rel].indexOf(val);
    if(index != -1) {
      this.metadata[rel].splice(index, 1);
      if (this.metadata[rel].length == 0)
        delete this.metadata[rel]
    }
  }
  return this;
}

Base.prototype.relations = function() {
  return Object.keys(this.metadata);
}

Base.prototype.merge = function(other) {
  var relations = other.metadataAsRelVal();
  relations.map(function(relation){
    this.addRelation(relation.rel, relation.val);
  }.bind(this));
}

Base.prototype.values = function(rel) {
  return this.metadata[rel];
}

Base.prototype.metadataAsRelVal = function() {
  var output = [];
  for (rel in this.metadata){
    if (this.metadata.hasOwnProperty(rel)) {
      var asRelVal = this.metadata[rel].map(function(val) {
        return {rel:rel, val:val};
      }.bind(this));
      output = output.concat(asRelVal);
    }
  }
  return output;
}

Base.prototype.toJSON = function(rel) {
  return JSON.stringify(this);
}

Base.prototype.setDescription = function (description) {
  this.removeRelations("urn:X-tsbiot:rels:hasDescription:en");
  this.addRelation("urn:X-tsbiot:rels:hasDescription:en", description);
  return this;
}

Base.prototype.description = function() {
  if (this.values("urn:X-tsbiot:rels:hasDescription:en"))
    return this.values("urn:X-tsbiot:rels:hasDescription:en")[0];
  else return undefined;
  return this;
}

Base.prototype.setContentType = function (ct) {
  this.addRelation("urn:X-tsbiot:rels:isContentType", ct);
  return this;
}

Base.prototype.contentType = function() {
  return this.values("urn:X-tsbiot:rels:isContentType");
}

Base.prototype.setHref = function(href){
  this._href = href;
  return this;
}

Base.prototype.href = function(){
  return this._href;
}

module.exports = Base;