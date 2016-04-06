var objectMerge = require('../objectMerge');

function BaseElement () {}

BaseElement.prototype.constructor = function (data, Fixture) {
    this.data = data;
    this.Fixture = Fixture;
};

BaseElement.prototype.setMasterbrand = function (id, name) {
    if (name === undefined) {
        name = id;
    }

    if (!this.data.master_brand) {
        this.data.master_brand = {
            titles: {}
        };
    }

    this.data.master_brand.id = id;

    if (id !== '') {
        this.data.master_brand.attribution = id + '_attr';
    }

    if (name !== '') {
        this.data.master_brand.titles.small = name;
        this.data.master_brand.titles.medium = name;
        this.data.master_brand.titles.large = name;
    }

    if (name === '') {
        this.data.master_brand.titles.small = name + ' small';
        this.data.master_brand.titles.medium = name + ' medium';
        this.data.master_brand.titles.large = name + ' large';
    }

    return this;
};

BaseElement.prototype.set = function (data) {
    objectMerge(true, this.data, data);
    return this;
};

BaseElement.prototype.clone = function() {
    return this.Fixture.Factory(JSON.parse(JSON.stringify(this.data)));
};

module.exports = BaseElement;
