var Fixture = require('./lib/Fixture'),
    FixtureLoader = require('./lib/FixtureLoader'),
    ElementPool = require('./lib/ElementPool'),
    Fetcher = require('./lib/Fetcher'),
    q = require('q'),
    fs = require('fs'),
    feedsPath = '../iblfetcher/feeds/';

q.longStackSupport = true;

function FixtureCreator(config) {
    that = this;
    that.config = config;
    that.feeds = {};
    that.elementPool = new ElementPool();
    that.fetcher = new Fetcher({
        apiKey: config.apiKey,
        iblUrl: config.iblUrl,
        proxy: config.proxy,
        cacheDir: config.cacheDir,
        cacheExpireTime: config.cacheExpireTime || (new Date().getTime() - (60 * 60 * 1000))
    });

    that.prefetch = that.fetcher.prefetch().then(function (feeds) {
        that.feeds = feeds;
        for (var name in feeds) {
            var feed = feeds[name];
            that.elementPool.processFeed(feed);
        }

        if (config.debug) {
            console.log('Processed feeds, found the following elements for use');
            console.log('Episodes:', that.elementPool.pools.Episode.length);
            console.log('Group:',that.elementPool.pools.Group.length);
            console.log('Programmes:',that.elementPool.pools.Programme.length);
        }

    }).fail(function (err) {
        console.log('Error prefetching feeds', err);
        throw err;
    });
}

FixtureCreator.prototype.createFixture = function(feedName, params) {
    var defer = q.defer(),
        newFeedDefer = q.defer(),
        that = this,
        path = feedName,
        cloneFeed;

    feed = that.feeds[feedName];
    if (feed === undefined) {
        that.fetcher.fetch(feedName, params).done(function (json) {
            that.feeds[feedName] = json;
            newFeedDefer.resolve(json);
        });
    } else {
        cloneFeed = JSON.parse(JSON.stringify(feed));
        newFeedDefer.resolve(cloneFeed);
    }

    newFeedDefer.promise.then(function (feed) {
        fixture = new Fixture(feedName, feed, that.elementPool, that.config);

        defer.resolve(fixture);
    }).fail(function (e) {
        defer.reject(e);
    }).done();

    return defer.promise;
};

module.exports = FixtureCreator;
module.exports.Loader = FixtureLoader;
