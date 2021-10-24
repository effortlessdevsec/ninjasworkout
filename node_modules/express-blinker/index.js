var fs = require("fs");
var path = require("path");
var MD5 = require("md5-file");
var async = require("async");
var mime = require("mime");
var debug = require("debug")("express-blinker");

function getTimedDateString(target) {
    var now = (typeof target != "undefined" ?
        target+(Date.now()) : Date.now()
    );
    var inst = new Date(now);
    var str = inst.toUTCString();
    return str;
}

function checkLastModified(data, cb) {
    // Skip!
    if(data._changed) return cb(null, data);

    if("if-modified-since" in data.req.headers) {
        fs.stat(data.file, function(err, stats) {
            if(err) return cb(err, data);
            data.stats = stats;
            var req_mtime = new Date(data.req.headers["if-none-match"]).getTime();
            var file_mtime = new Date(stats.mtime).getTime();
            if(file_mtime > req_mtime) {
                // Instruct the engine to serve the file.
                data._changed = true;
                data.status = 200;
            } else {
                // The file is unchanged. Serve a 304.
                data.status = 304;
            }
            cb(null, data);
        });
    } else {
        return cb(null, data);
    }
}

function checkETag(data, cb) {
    // Skip!
    if(data._changed) return cb(null, data);

    // Do our thing.
    MD5(data.file, function(err, msg){
        if(err) return cb(err, data);
        data.hash = msg;
        if(data.req.headers["if-none-match"] != msg) {
            // The entity has been changed.
            data._changed = true;
            data.status = 200;
        } else {
            // Stuff is as it was before.
            data._changed = false;
            data.status = 304;
        }
        cb(null, data);
    });
}

function checkSanity(data, cb) {
    // This is useful if both content checkers are off.
    if(!data.options.etag && !data.options.lastModified) {
        data._changed = true;
        data.status = 200;
    }
    cb(null, data);
}

function makeExpires(data, cb) {
    data.headers.push(["Expires", getTimedDateString(data.options.age)]);
    cb(null, data);
}
function makeCacheControl(data, cb) {
    var parts = [];
    parts.push(data.options.cacheKeywords || "public");
    parts.push("max-age="+data.options.age);
    data.headers.push(["Cache-Control", parts.join(", ")]);
    cb(null, data);
}

// More risky
function makeLastModified(data, cb) {
    var stats = data.stats;
    var dateStr = (new Date(stats.mtime)).toUTCString();
    data.headers.push(["Last-Modified", dateStr]);
    cb(null, data);
}

function makeETag(data, cb) {
    data.headers.push(["ETag", data.hash]);
    cb(null, data);
}

/* [
    {
        test: /\.(png|jp?g)$/,
        age: "10 days",
        expires: true,
        cacheControl: true,
        cacheKeywords: "public",
        lastModified: false,
        etag: false
    }
] */
module.exports = function Blinker(basePath, confs) {
    return function(req, res, next) {
        // Search for a fitting set of options...
        var options;
        for(var k in confs) {
            var segment = confs[k];
            if(segment.test.test(req.url)) {
                // Aha! This is the one. Save, break, continue.
                options = segment;
                break;
            }
        }

        var filePath = basePath + req.url;
        async.series({
            fileExists: function fileExists(cb) {
                fs.exists(filePath, function(exists){
                    if(exists) cb(null, exists);
                    else cb(new Error(filePath+" does not exist."));
                });
            },
            isFile: function isFile(cb) {
                fs.stat(filePath, function(err, stats){
                    if(stats.isFile()) cb(null, true);
                    else cb(new Error("Not a file."));
                });
            }
        }, function(err){
            if(err) {
                debug(err);
                next();
            } else {
                var wave = [];

                // Add checks
                if(options.lastModified) wave.push(checkLastModified);
                if(options.etag) wave.push(checkETag);
                wave.push(checkSanity);

                // Add makers
                if(options.expires)
                    wave.push(makeExpires);

                if(options.cacheControl)
                    wave.push(makeCacheControl);

                if(options.lastModified)
                    wave.push(makeLastModified);

                if(options.etag)
                    wave.push(makeETag);

                var runner = async.seq.apply(async.seq, wave);
                var data = {
                    res: res,
                    req: req,
                    file: basePath + req.url,
                    options: options,
                    headers: [],
                    _changed: false,
                    status: 200
                };
                // Execute the wave and return.
                runner(data, function(err, result){
                    if(err) return next(err);
                    if(result._changed) {
                        // Serve the file
                        for(var rk in result.headers) {
                            var pair = result.headers[rk];
                            res.setHeader(pair[0], pair[1]);
                        }
                        res.setHeader("Content-Type", mime.lookup(result.file));
                        res.status(result.status);
                        fs.createReadStream(result.file).pipe(res);
                    } else {
                        res.status(result.status).end();
                    }
                });
            }
        });
    }
}
