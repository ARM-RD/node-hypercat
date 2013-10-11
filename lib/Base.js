
var _ = require("underscore");

function Base () {
  this.metadata = [];
  this.items = [];
  this._href = null;
}

Base.prototype.addRelation = function(rel, val) {
  this.metadata.push({rel:rel, val:val});
  return this;
}

Base.prototype.tagsWith = function(rel, val) {
  return _.filter(
    this.metadata,
    function(i) {
      var relMatch = (i.rel.localeCompare(rel) == 0);
      var valMatch = (i.val.localeCompare(val) == 0);
      if ((typeof rel != 'undefined') && (typeof val != 'undefined'))
        return relMatch && valMatch;
      if (typeof rel != 'undefined')
        return relMatch;
      if (typeof val != 'undefined')
        return valMatch;
      else return false;
    }
  );
}

Base.prototype.tagsWithout = function(rel, val) {
  return _.filter(
    this.metadata,
    function(i) {
      var relMatch = (i.rel.localeCompare(rel) != 0);
      var valMatch = (i.val.localeCompare(val) != 0);
      if ((typeof rel != 'undefined') && (typeof val != 'undefined'))
        return relMatch && valMatch;
      if (typeof rel != 'undefined')
        return relMatch;
      if (typeof val != 'undefined')
        return valMatch;
      else return false;
    }
  );
}


Base.prototype.removeRelations = function(rel, val) {
  this.metadata = this.tagsWithout(rel, val);
  return this;
}

Base.prototype.values = function(rel) {
  return this.tagsWith(rel).map(function(i) { return i.val });
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