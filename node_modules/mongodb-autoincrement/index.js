/**
 * Auto increment support for mongodb and mongoose
 * Created by Alexey Chistyakov <ross@newmail.ru> on 11.10.2014.
 */

var settings = {};
var defaultSettings = {
    collection: "counters",
    field: "_id",
    step: 1
};

/**
 * Get next sequence id for the given collection in the given database
 *
 * @param {MongodbNativeDriver} db Connection to mongodb native driver
 * @param {String} collectionName Current collection name to get auto increment field for
 * @param {String} [fieldName] Auto increment field in collection collectionName
 * @param {Function} callback callback(err, number)
 */
exports.getNextSequence = function (db, collectionName, fieldName, callback) {
    if (typeof fieldName == "function") {
        callback = fieldName;
        fieldName = null;
    }

    if (db._state == "connecting") {
        db.on("open", function (err, db) {
            getNextId(db, collectionName, fieldName, callback);
        });
    } else {
        getNextId(db, collectionName, fieldName, callback);
    }
};

/**
 * Plugin for Mongoose
 * Usage:
 * 1) Global scope. It will be applied to all schemas with _id option field set
 *    var mongoose = require("mongoose");
 *    var autoincrement = require("mongodb-autoincrement");
 *    mongoose.plugin(autoincrement.mongoosePlugin);
 * 2) Schema scope
 *    var Schema = require("mongoose").Schema;
 *    var autoincrement = require("mongodb-autoincrement");
 *    var schema = new Schema(...);
 *    schema.plugin(autoincrement.mongoosePlugin);
 *
 * @param {MongooseSchema} schema
 * @param {Object} [options]
 */
exports.mongoosePlugin = function (schema, options) {
    options = options || {};
    var fieldName = options.field || defaultSettings.field;

    if (schema.options._id) {
        var schemaField = {};
        schemaField[fieldName] = {type: Number, unique: true, required: true};
        schema.add(schemaField);
    }

    schema.pre('save', function (next) {
        var doc = this;

        if (doc.isNew && doc.collection) {
            if (!settings[doc.collection.name]) {
                settings[doc.collection.name] = options;
            }

            exports.getNextSequence(doc.db.db, doc.collection.name, fieldName, function (err, result) {
                doc[fieldName] = result;
                next(err);
            });
        } else {
            next();
        }
    });
};

/**
 * Redefine default options
 *   - collection - name of the collection in db to hold sequence counters (default: counters)
 *   - field - name of the field to auto increment (default: _id)
 *   - step - auto increment step (default: 1)
 * @param {Object} options
 */
exports.setDefaults = function (options) {
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            defaultSettings[key] = options[key];
        }
    }
};

/**
 * Get next auto increment index for the given collection
 * @param {MongodbNativeDriver} db
 * @param {String} collectionName
 * @param {String} [fieldName]
 * @param {Function} callback
 */
function getNextId(db, collectionName, fieldName, callback) {
    if (typeof fieldName == "function") {
        callback = fieldName;
        fieldName = null;
    }

    fieldName = fieldName || getOption(collectionName, "field");
    var collection = db.collection(defaultSettings.collection);
    var step = getOption(collectionName, "step");

    collection.findAndModify(
        {_id: collectionName, field: fieldName},
        null,
        {$inc: {seq: step}},
        {upsert: true, new: true},
        function (err, result) {
            if (err) {
                if (err.code == 11000) {
                    process.nextTick(getNextId.bind(null, db, collectionName, fieldName, callback));
                } else {
                    callback(err);
                }
            } else {
                if (result.value && result.value.seq) {
                    callback(null, result.value.seq);
                } else {
                    callback(null, result.seq);
                }
            }
        }
    );
}

function getOption(collectionName, optionName) {
    return settings[collectionName] && settings[collectionName][optionName] !== undefined ?
        settings[collectionName][optionName] :
        defaultSettings[optionName];
}

