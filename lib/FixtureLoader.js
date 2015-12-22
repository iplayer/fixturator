var fs = require('fs'),
    path = require('path'),
    util = require('util');

module.exports = function (directory) {
    return {
        load: function (fixtureName) {
            var fixtureFile = util.format('%s.json', fixtureName),
                fixturePath = path.resolve(directory, fixtureFile),
                fixture = fs.readFileSync(fixturePath, { encoding: 'utf-8' });

            return {
                status: fixture.split('\n')[0].split(' ')[1],
                json: JSON.parse(fixture.split('\n\n')[1])
            };
        }
    };
};
