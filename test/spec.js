var vows = require('vows');
var assert = require('assert');
var Hypercat = require('../lib/Hypercat');
var Resource = require('../lib/Resource');


var BASIC_CAT = JSON.stringify({ 'item-metadata':[{
                    rel: 'urn:X-tsbiot:rels:isContentType',
                    val: 'application/vnd.tsbiot.catalogue+json' }, {
                    rel: 'urn:X-tsbiot:rels:hasDescription:en',
                    val: 'a description' }],
                items: [] });

var BASIC_ITEM = JSON.stringify({
                  href:'http://example.com',
                  'i-object-metadata':[{
                    rel: 'urn:X-tsbiot:rels:isContentType',
                    val: 'application/json' },{
                    rel: 'urn:X-tsbiot:rels:hasDescription:en',
                    val: 'a description'}]});

var BASIC_CAT_WITH_ITEM = JSON.stringify({'item-metadata':[{
                    rel: 'urn:X-tsbiot:rels:isContentType',
                    val: 'application/vnd.tsbiot.catalogue+json' },{
                    rel: 'urn:X-tsbiot:rels:hasDescription:en',
                    val: 'a description'}],
                  items: [{
                  href:'http://example.com/someresource',
                  'i-object-metadata':[{
                    rel: 'urn:X-tsbiot:rels:isContentType',
                    val: 'application/json' },{
                    rel:'urn:X-tsbiot:rels:hasDescription:en',
                    val:'a description'}]
                }]});

var BASIC_CAT_WITH_CAT = JSON.stringify({'item-metadata':[{
                    rel: 'urn:X-tsbiot:rels:isContentType',
                    val: 'application/vnd.tsbiot.catalogue+json' },{
                    rel: 'urn:X-tsbiot:rels:hasDescription:en',
                    val: 'outer'}],
                  items: [{
                  href:'http://example.com/someresource',
                  'i-object-metadata':[{
                    rel: 'urn:X-tsbiot:rels:isContentType',
                    val: 'application/vnd.tsbiot.catalogue+json' },{
                    rel:'urn:X-tsbiot:rels:hasDescription:en',
                    val:'inner'}]
                }]});

/*var outer = new Hypercat("outer");
var inner = new Hypercat("inner");
outer.addItem(inner, "http://example.com/someresource");
console.log(BASIC_CAT_WITH_CAT);
console.log(Hypercat.fromJSON(outer.toJSON()).toJSON());
*/

// Create a Test Suite
vows.describe('Hypercat library').addBatch({
  'Creating a top level catalog': {
    topic: new Hypercat("a description"),
    
    'we get a hypercat object': function (cat) {
      assert.instanceOf(cat, Hypercat)
    },
    
    'with a description function': function (cat) {
      assert.equal(cat.description(), "a description")
    },
    
    'that converts to JSON': function (cat) {
      assert.equal(JSON.stringify(cat.toJSON()), BASIC_CAT);
    },
  },
  
  'Resource can be created': {
    topic: new Resource("a description", "application/json").setHref("http://example.com"),
    
    'we get an Item object': function (item) {
      assert.instanceOf(item, Resource)
    },
    
    'with a description function': function (item) {
      assert.equal(item.description(), "a description")
    },
    
    'with a href function': function (item) {
      assert.equal(item.href(), "http://example.com")
    },
    
    'that converts to JSON': function (item) {
      assert.equal(JSON.stringify(item.toJSON()), BASIC_ITEM);
    },
  },
  
  'Resource can be added to a catalog': {
    topic: function() {
      var cat = new Hypercat("a description");
      var item = new Resource("a description", "application/json").setHref("http://example.com");
      cat.addItem(item, "http://example.com/someresource");
      return cat;
    },
    
    'that converts to JSON': function (cat) {
      assert.equal(JSON.stringify(cat.toJSON()), BASIC_CAT_WITH_ITEM);
    },
  },
  
  'Catalog can be added to a catalog': {
    topic: function() {
      var outer = new Hypercat("outer");
      var inner = new Hypercat("inner");
      outer.addItem(inner, "http://example.com/someresource");
      return outer;
    },
    
    'that converts to JSON': function (cat) {
      assert.equal(JSON.stringify(cat.toJSON()), BASIC_CAT_WITH_CAT);
    }
  },
  
  'Converts to and from JSON': {
    topic: function() {
      var outer = new Hypercat("outer");
      var inner = new Hypercat("inner");
      outer.addItem(inner, "http://example.com/someresource");
      return Hypercat.fromJSON(outer.toJSON());
    },
    
    'that converts to JSON': function (cat) {
      assert.equal(JSON.stringify(cat.toJSON()), BASIC_CAT_WITH_CAT);
    }
  },
    
  'Hypercat can be got': {
    topic: function() {
      Hypercat.get("https://alertmeadaptor.appspot.com/cat", this.callback);
    },
    
    'we get a Hypercat object': function (err, item) {
      assert.instanceOf(item, Hypercat)
    }
  },
    
  'Hypercat can be filtered with relationFilter': {
    topic: function() {
      var cat = new Hypercat("a description");
      var item = new Resource("a description", "application/json").setHref("http://example.com");
      cat.addItem(item, "http://example.com/someresource");
      return cat.filter(cat.relationFilter(['not there']));
    },

    'to no items': function (item) {
      //console.log(JSON.stringify(item));
      return (item.items().length == 0);
      //assert.instanceOf(item, Hypercat)
    }
  },

  'Hypercat can be reduced by filtering with relationValueFilter': {
    topic: function() {
      var cat = new Hypercat("a description");
      var item = new Resource("a description", "application/json").setHref("http://example.com");
      cat.addItem(item, "http://example.com/someresource");
      return cat.filter(cat.relationValueFilter([{'not there':'value'}, {'not there either':'value2'}]));
    },

    'to no items': function (item) {
      return (item.items().length == 0);
      //assert.instanceOf(item, Hypercat)
    }
  },

  'Hypercat passes some items with relationValueFilter': {
    topic: function() {
      var cat = new Hypercat("a description");
      var item = new Resource("a description", "application/json").setHref("http://example.com");
      cat.addItem(item, "http://example.com/someresource");
      return cat.filter(cat.relationValueFilter([{'urn:X-tsbiot:rels:isContentType':'application/json'}]));
    },

    'to some items': function (item) {
      //console.log(JSON.stringify(item));
      return (item.items().length > 0);
      //assert.instanceOf(item, Hypercat)
    }
  }
}).run(); // Run it*/
