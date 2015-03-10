var express = require('express');
var MBTiles = require('mbtiles');
var Q = require('q');

var serve = function(mbtiles) {
    var PORT = 7173;

    var getTile = function(z, x, y) {
        var deferred = Q.defer();

        mbtiles.getTile(z, x, y, function(err, tile) {
            if (err) {
                deferred.reject(err.message);
            }
            else {
                deferred.resolve(tile);
            }
        });

        return deferred.promise;
    };

    var serveTile = function(req, res) {
        var params = req.params;
        var promise = getTile(params.z, params.x, params.y);

        promise.then(function(tile) {
            res.header('Content-Type', 'image/png');
            res.send(tile);
        });

        promise.fail(function(message) {
            res.header('Content-Type', 'text/html');
            res.status(404).send(message + '\n');
        });
    };

    var app;
     // Server
    app = express();
    app.use(express.static(__dirname + '/../www'));
    app.get('/:z/:x/:y.*', serveTile);
    app.listen(PORT);
};

var main = function(args) {
    var filename;

    // Load the file
    filename = args[2];
    console.log('Loading: ' + filename);

    new MBTiles(filename, function(err, mbtiles) {
        if (err) {
            throw err;
        }
        serve(mbtiles);
    });
};

main(process.argv);
