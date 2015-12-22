iBL Fixture Generator
=====================

Script fixtures to be generated from live data. Modify only the data you care about and keep fixtures up to date.

Caches the results for 1 hour after a successful request and retries 3 times to allow for API downtime.

Quick start
-----------
Setup your fixture file, all fixtures share a common structure so copy paste is your friend:

```javascript
module.exports = function (creator, fixtureName) {
    return creator.createFixture('categories/films/highlights').then(function (fixture) {
        fixture.save(fixtureName);
    })
};
```

Line by line:
 - Export your fixture to the fixture runner
 - Create your fixture, specifying a feed name and and URL parameters
 - `.then` will fire it's function once the fixture file is ready for use
 - Save your fixture to the right file passed by the runner, or customised

Now we can start modifying stuff, like the first items title:

```javascript
module.exports = function (creator, fixtureName) {
    return creator.createFixture('categories/films/highlights').then(function (fixture) {

        fixture.getEpisode().set({
            title: 'Hai from the fixture'
        });

        fixture.save(fixtureName)
    })
};
```

Or labels:

```javascript
module.exports = function (creator, fixtureName) {
    return creator.createFixture('categories/films/highlights').then(function (fixture) {

        fixture.getEpisode().set({
            title: 'Hai from the fixture',
            labels: {
                editorial: 'WATCH ME!'
            }
        });

        fixture.save();
    }).done()
};
```

# CLI

To generate fixtures from a set of fixturator scripts as seen above you can use the fixturator cli:

`fixturator <apiBaseUrL> <fixtureDir>`

This will create a `cache` and `generated` directory inside the fixture directory to store the fixture data as well as a local cache for when the api is down.

#API

## Fixture

The base object you operate on has the following methods:

```javascript
getEpisode(n) / getProgramme(n) / getElement(n)
```

Fetches the `n`th item from the feed, will return the relevant class object.

Use the most semantically correct for your situation.

e.g. Programmes feed should use `getProgramme(2)` whereas highlights feed should use `getElement` as it could be a group.



```javascript
insertEpisode(n) / insertProgramme(n) / insertGroup(n) / insertMostPopular(n)
```

Inserts the given type into that position in the feed. The item it will insert is randomly selected from the pool of items seen in all other iBL feeds.
If you use this method you will need to assert that everything on the new item is as you are expecting (availability, labels, stacked group etc.).

```javascript
save()
```

Save the fixture to a folder specified in config. Default file name is the feed name with `/` replaced with `_`.

## Elements
All elements can be modified with the `set()` function. Pass in an object containing the attributes you want to modify:

```javascript
group.set({
    title: 'New Group title for me!',
    stacked: true
})
```

Or chain together to modify other attributes too:

```javascript
group.set({
    title: 'New Group title for me!',
    stacked: true
}).getChild(0).set({
    synopses: {
        small: 'A brand new synopses'
    }
});
```

Elements should also provide helper methods which need to modify multiple attributes
to be consistent such as availability (which should modify `status` and
`availability` information at the same time to be useful).

### All elements inherit some base fuctions

```javascript
set()
```
Pass in an object of data you want to  merge **into** the element, it will override/add any properties from the object to the element. Also useful for chaining methods as it returns the element again.

```javascript
setMasterbrand
```
Pass in a masterbrand ID shaped thing and it will prefil fields with the ID plus the field size etc.

### Programme

```javascript
getEpisode(n)
```
Retrieve the `n`th Episode for the programme, returns a `Episode` object.

```javascript
addEpisode(n)
```
Add an episode in position `n`, plucked randomly from the Pool, also ups the count for the programme. Returns the episode added.

```javascript
trimTo(n)
```

Removes all but the first `n` child episodes.

```javascript
removeAllItems()
```
Removes all child episodes and sets the count of episodes to 0 (alias for `trimTo(0)`).

### Group

```javascript
getChild(n)
```
Retrieve the `n`th child for the group, returns a `Episode` or `Programme` object.

### Episode

```javascript
getVersion(n)
```
Retrieve the `n`th version for the episode, returns a `Version` object.

```javascript
removeAllVersions()
```
Get rid of all versions on the episode. Returns the Episode.

```javascript
addVersion()
```
Adds the single stored Version object, this can then be cusotmized using `set()`. returns a Version.

### Version

Currently has no methods.

### Construction

```javascript
var config = {
        savePath: './fixtures/',
        fixturePath: './tests/',
        apiKey: '',
        iblUrl: '',
        cacheDir: './feedCache/',
        debug: true
    },
    fs = require('fs'),
    Fixtures = require('ibl-fixture-generator'),
    creator = new Fixtures(config);

    creator.prefetch.done(function () {
        files = fs.readdirSync('./tests')

        files.forEach(function (file) {
            stat = fs.statSync(config.fixturePath + file);
            if (stat.isFile()) {
                var func = require(config.fixturePath + file);
                fixtureName = file.substr(0, file.length - 3);
                func(creator, fixtureName);
            }

        })
    })

```

## Loader

As fixtures are generated with all headers in tact they're not valid json, the fixturator loader allows you to load fixture files from a given directory:

```javascript
var fixtureLoader = require('fixturator').Loader(fixtureDir);
var fixture = fixtureLoader.load('generated/cake');
```

It has a single method once instantiated:

```javascript
load(fixture)
```

Parses the `fixture` file into two properties, `json` with the fixture json and `status` which is the HTTP response code to use when mocking.
