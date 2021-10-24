var express = require("express"),
    app = express(),
    blinker = require("../"),
    path = require("path"),
    basePath = path.join(__dirname, "public");

app.use(blinker(basePath, [{
    test: /.*/,
    etag: true,
    lastModified: false,
    cacheControl: true,
    expires: true,
    age: 600
}]));

app.listen(1234);
console.log("Listening on 0.0.0.0:1234...");
