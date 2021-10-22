# mongodb-autoincrement
=====================

Module to auto increment mongodb _id index. There is also mongoose plugin here.

## Installing

> npm install mongodb-autoincrement

## Using

### ...with mongodb-native driver

Gets next auto increment integer index from database for the given collection. 
The successive calls to this function return different values so you can safely use it in multi client applications.

> getNextSequence(db, collectionName, fieldName, callback)

* db - mongodb-native driver connection object
* collectionName - name of the collection to get auto increment index for, string
* fieldName - name of the auto increment field [optional]
* callback - function (err, nextFreeIndex)

````js
var MongoClient = require("mongodb").MongoClient;
var autoIncrement = require("mongodb-autoincrement");

MongoClient.connect(url, function (err, db) {
    autoIncrement.getNextSequence(db, collectionName, function (err, autoIndex) {
        var collection = db.collection(collectionName);
        collection.insert({
            _id: autoIndex,
            ...
        });
    });
});
````

### ...with mongoose

The plugin can be applied to particular schema and globally.

> mongoosePlugin(schema, options)

* schema - mongoose.Schema
* options - Object:
    * field - auto increment field name, default _id
    * step - auto increment step, default 1

#### With single schema plugin

````js
var mongoose = require('mongoose');
var autoIncrement = require("mongodb-autoincrement");

var schema = new mongoose.Schema({
    ...
});

schema.plugin(autoIncrement.mongoosePlugin);
````

#### Global plugin usage

While using plugin as global mongoose plugin it will be applied to all schemas with no {_id: false} option set.

````js
var autoIncrement = require("mongodb-autoincrement");
var mongoose = require('mongoose');
mongoose.plugin(autoIncrement.mongoosePlugin, optionalOptions);

var schema1 = new mongoose.Schema({    // _id field will be auto incremented integer
    ...
});

var schema2 = new mongoose.Schema({    // plugin will not be applied
    ...
}, {_id: false});
````

### Setting default options

````js
var autoIncrement = require("mongodb-autoincrement");
autoIncrement.setDefaults({
    collection: collectionName,     // collection name for counters, default: counters
    field: fieldName,               // auto increment field name, default: _id
    step: integerNumber             // auto increment step
});
````

## Notes

You cannot set initial values for auto increment fields by the module. 
If you need it you can always set them directly via mongodb.
Find a record with _id 'collectionName' in the collection 'counters' and set field 'seq' to required value.

Counters collection structure:

````js
{
    _id: collectionName,        // name of the collection for which auto increment id field is set
    field: fieldName,           // name of the field to auto increment in the collection collectionName
    seq: integerValue           // last auto increment value used
}
````
