/**
 * builder.js
 * 
 * A query builder class for MediaWiki API requests.
 */
'use strict';

/**
 * Importing modules
 */
const util = require('../util.js');

/**
 * Main class
 * @class MediaWikiQueryBuilder
 */
class MediaWikiQueryBuilder {
    constructor(io, client, action) {
        this._io = io;
        this._client = client;
        this._action = action;
        this._transform = d => d;
        this._data = {};
        this._prefix = '';
    }
    _call(method) {
        return this._io.api(method, this._action, this._data, this._transform);
    }
    get() {
        return this._call('GET');
    }
    post() {
        return this._call('POST');
    }
    token(name) {
        this.param('token', this._client.token(name));
        return this;
    }
    prefix(prefix) {
        this._prefix = prefix;
        return this;
    }
    param(name, value) {
        const prop = `${this._prefix}${name}`;
        switch (util.type(value)) {
            case 'array':
                this._data[prop] = value.join('|');
                break;
            case 'boolean':
                this._data[prop] = value ? 1 : 0;
                break;
            case 'string':
            case 'number':
                this._data[prop] = value;
                break;
        }
        return this;
    }
    params(params) {
        if (util.type(params) === 'object') {
            util.each(params, this.param, this);
        }
        return this;
    }
    page(page) {
        switch (util.type(page)) {
            case 'number':
                this.param('pageid', page);
                break;
            case 'string':
                this._data.title = page;
                break;
            case 'array':
                switch (util.type(page[0])) {
                    case 'number':
                        this.param('pageids', page);
                        break;
                    case 'string':
                        this.param('titles', page);
                        break;
                }
                break;
        }
        return this;
    }
    pages(pages) {
        return this.page(pages);
    }
    watchlist(status) {
        switch (status) {
            case true:
            case 'watch':
                this.param('watchlist', 'watch');
                break;
            case false:
            case 'unwatch':
                this.param('watchlist', 'unwatch');
                break;
            case null:
            case 'nochange':
                this.param('watchlist', 'nochange');
        }
        return this;
    }
    transform(func) {
        if (util.type(func) === 'function') {
            this._transform = func;
        }
        return this;
    }
}

module.exports = MediaWikiQueryBuilder;