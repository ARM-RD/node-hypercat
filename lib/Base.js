
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

Base.prototype.tagsWithRel = function(rel) {
  return _.filter(
    this.metadata,
    function(i) { return i.rel.localeCompare(rel) == 0; }
  );
}

Base.prototype.tagsWithoutRel = function(rel) {
  return _.filter(
    this.metadata,
    function(i) { return i.rel.localeCompare(rel) != 0; }
  );
}

Base.prototype.removeAllRelations = function(rel) {
  this.metadata = this.tagsWithoutRel(rel);
  return this;
}

Base.prototype.values = function(rel) {
  return this.tagsWithRel(rel).map(function(i) { return i.val });
}

Base.prototype.toJSON = function(rel) {
  return JSON.stringify(this);
}

Base.prototype.setDescription = function (description) {
  this.removeAllRelations("urn:X-tsbiot:rels:hasDescription:en");
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