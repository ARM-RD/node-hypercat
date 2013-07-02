var vows = require('vows');
var assert = require('assert');
var NSP = require('../lib/nsp');


// Create a Test Suite
vows.describe('NSP client library').addBatch({
  'creating a raw nsp client library object': {
    topic: NSP({address:'localhost'}),
    
    'we get an nsp object': function (nsp) {
      assert.isObject(nsp)
    },
    
    'with an auth function': function (nsp) {
      assert.isFunction(nsp.auth)
    },
    
    'and some options': function (nsp) {
      assert.isObject(nsp.options)
    }
  },

  'that we can provide auth credentials to': {
    topic: function() {
      return NSP({address:'localhost'}).auth('admin', 'secret', 'domain')
    },
    
    'we get a domain object': function (domain) {
      assert.isObject(domain)
    },
    
    'with a list function': function (domain) {
      assert.isFunction(domain.list)
    },
    
    'and a domain selector': function (domain) {
      assert.isFunction(domain.domain)
    }
  },

  'listing nsp domains': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'domain').list([], this.callback)
    },
    
    'does not error': function (err, domains) {
      assert.isNull(err);
    },
    
    'returns a list': function (err, domains) {
      assert.isArray(domains);
    }
  },
    
  'listing nsp domains with metadata': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'domain').list.metadata([], this.callback)
    },
    
    'does not error': function (err, domains) {
      assert.isNull(err);
    },
    
    'returns a list': function (err, domains) {
      assert.isArray(domains);
    },
  },
  
  'handles invalid addresses': {
    topic: function() {
      NSP({address:'this wont exist'}).auth('admin', 'secret', 'domain').list.metadata([], this.callback)
    },
    
    'errors gracefully': function (err, domains) {
      assert.instanceOf(err, Error);
    },
    
    'with an response code': function (err, domains) {
      assert.isNotNull(err.code());
    },
    
    'not with a 20X code': function (err, domains) {
      assert(err.code() < 200 || err.code() > 299);
    }
  },
  
  'select domain by name': {
    topic: function() {
      return NSP({address:'localhost'}).auth('admin', 'secret', 'domain').domain('domain');
    },
    
    'has a list function': function (domain) {
      assert.isFunction(domain.list)
    } 
  },
  
  
  'list endpoints on domain': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'domain').domain('domain').list([], this.callback);
    },
    
    'does not error': function (err, endpoints) {
      assert.isNull(err);
    },
    
    'returns a list': function (err, endpoints) {
      assert.isArray(endpoints);
    },
  },
    
  'list endpoints on domain with metadata': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'domain').domain('domain').list.metadata([], this.callback);
    },
    
    'does not error': function (err, endpoints) {
      assert.isNull(err);
    },
    
    'returns a list': function (err, endpoints) {
      assert.isArray(endpoints);
    },
  },
  
  'select an endpoint by name': {
    topic: NSP({address:'localhost'}).auth('admin', 'secret', 'domain').domain('domain').endpoint('switch-node-001'),
    
    'has a list function': function (domain) {
      assert.isFunction(domain.list)
    }
  },


  'list resources on an endpoint': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'domain').domain('domain').endpoint('switch-node-001').list([], this.callback);
    },
    
    'does not error': function (err, endpoints) {
      assert.isNull(err);
    },
    
    'returns a list': function (err, endpoints) {
      assert.isArray(endpoints);
    },
  },
    
  'list resources on an endpoint with metadata': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'domain').domain('domain').endpoint('switch-node-001').list.metadata([], this.callback);
    },
    
    'does not error': function (err, endpoints) {
      assert.isNull(err);
    },
    
    'returns a list': function (err, endpoints) {
      assert.isArray(endpoints);
    },
  },
  
  'creating a new domain': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'my-new-domain').create('my-new-domain', {}, this.callback);
    },
    
    'does not error': function (err, endpoints) {
      assert.isNull(err);
    }
  },
  
  'deleting an existing domain': {
    topic: function() {
      NSP({address:'localhost'}).auth('admin', 'secret', 'my-new-domain').domain('my-new-domain').destroy(this.callback);
    },
    
    'does not error': function (err, endpoints) {
      assert.isNull(err);
    }
  }



}).run(); // Run it