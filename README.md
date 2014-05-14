# node-hypercat

A small library for fetching, pushing and manipluting Hypercats. Read more about Hypercat here: <http://wiki.1248.io/doku.php?id=hypercat>

Based on: https://github.com/1248/Tools/tree/master/hypercat_py

```javascript
var hypercat = require('node-hypercat');
```

## Opening/creating HyperCats

```javascript
// Create a HyperCat
var cat = new hypercat.Hypercat();

// Load from JSON
var jsonCat = hypercat.Hypercat.fromJSON(json);

// Open a remote HyperCat
hypercat.Hypercat.get('http://data.openiot.org/cat', function (err, remoteCat) {
    var items = cat.items();
    console.log(items);
});
```

## Inspecting a HyperCat

```javascript
// View available metadata relations
var items = cat.relations();

// Get meta-data values (as array)
console.log(cat.values('urn:X-tsbiot:rels:isContentType'));

// View metadata as object
console.log(cat.metadata);
```

### Getting items

```javascript
// Items are resources
var items = cat.items();

// Resources have URLs
var res = items[0];
console.log(res.href());

// Resources have metadata, like HyperCats
console.log(res.relations());

// You can filter for particular items
var filteredItems = cat.items(function (item) {
    // only return plain JSON resources
    return item.values('some-link-rel').indexOf('application/json') !== -1;
});
```

### Getting sub-catalogs

```javascript
var subCats = cat.subcatalogs();
```

## Example - walking all HyperCats

```javascript
function walkCat(url, callback) {
    hypercat.Hypercat.get(url, function (err, remoteCat) {
        console.log('Fetched ' + url);
        if (err) return callback(err);
        async.map(remoteCat.items(), function (item, callback) {
            if (item.contentType()[0] === "application/vnd.tsbiot.catalogue+json") {
                // It's a HyperCat - walk it
                console.log("Walking HyperCat: " + item.href());
                walkCat(item.href(), callback);
            } else {
                // It's a resource - collect it into a list
                process.nextTick(function () {
                    callback(null, [item]);
                });
            }
        }, function (err, results) {
            console.log(results);
            if (err) return callback(err);
            var items = [];
            results.forEach(function (list) {
                items = items.concat(list);
            });
            callback(null, items);
        });
    });
}
```

#Logo
The [logo](https://github.com/ARM-RD/node-hypercat/blob/master/logo/hypercat.svg) is released under the permissive [CC-BY](http://creativecommons.org/licenses/by/4.0/legalcode) license which allows modification and re-distribution provided that the original author is credited.



#License

Copyright (c) 2014 Andy Pritchard, ARM Ltd. &lt;firstname.lastname@arm.com&gt;
 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
