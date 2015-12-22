#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    Fixtures = require('../');

if (process.argv.length < 4) {
    console.log('Usage: fixturator <apiBaseUrl> <fixtureDir>');
    process.exit(1);
}

var apiUrl = process.argv[2],
    fixtureDir = process.argv[3],
    fixtureConfig = {
        savePath: path.resolve(fixtureDir, 'generated') + '/',
        fixturePath: path.resolve(fixtureDir) + '/',
        iblUrl: apiUrl,
        cacheDir: path.resolve(fixtureDir, 'cache') + '/',
        proxy: process.env.http_proxy,
        debug: true,
        spaces: '  '
    },
    creator = new Fixtures(fixtureConfig);

// Nuke and remake generated folder
rimraf.sync(fixtureConfig.savePath);
try { fs.mkdirSync(fixtureConfig.savePath); } catch (e) {}
try { fs.mkdirSync(fixtureConfig.cacheDir); } catch (e) {}

function failHandler(err) {
    throw err;
}

creator.prefetch.then(function () {
    var files = fs.readdirSync(fixtureConfig.fixturePath);

    files.forEach(function (file) {
        console.time(file);

        var ext = path.extname(file),
            fileName = path.basename(file, ext),
            stat = fs.statSync(fixtureConfig.fixturePath + file);

        if (ext === '.js' && stat.isFile()) {
            var func = require(fixtureConfig.fixturePath + file);

            func(creator, fileName).then(function () {
                console.timeEnd(file);
            }).fail(failHandler).done();
        }
    });
}).fail(failHandler).done();
