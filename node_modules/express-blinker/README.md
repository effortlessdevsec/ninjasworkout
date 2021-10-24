# Blinker, because your site needs speed.

"Blinker" is actually a german word and it reffers to that blinking light on a car or motorcycle with which you indicate which direction you are going to take. And that is what thi smodule does; you tell it how to cache, and it will direct your browser!

## Install

    npm install express-blinker

## Usage
```javascript
var express = require("express"),
    app = express(),
    blinker = require("express-blinker"),
    path = require("path"),
    basePath = path.join(__dirname, "public");

app.use(blinker(basePath, [
    {
        test: /.*/,
        etag: true,
        lastModified: false,
        cacheControl: true,
        expires: false,
        age: 600
    }
]));

app.listen(1234);
```

## `blinker(basePath, options)`

- `basePath`: This is the full path to your resources that you want to deliver.
- `options`: This is an object. You must specify __all__ options. This ensures no unexpected behaviour.
    * `options.test`: This is a regular expression that is used to see which of your configuration objects should be used. You could use this to pick up files based on their extension or naming.
    * `options.etag`: Wether to do ETagging.
    * `options.lastModified`: Wether the browser a `Last-Modified` header.
    * `options.cacheControl`: Wether to generate and send a `Cache-Control` header.
    * `options.cacheKeyword`: Used when generating a `Cache-Control` header.
    * `option.expires`: Wether to send an `Expires` header.
    * `options.age`: This is very required. Specify the cache time in seconds.
