/**
 * module.js
 * 
 * Base class for MediaWiki modules
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('../module.js'),
      QueryBuilder = require('./builder.js');

/**
 * Main class
 * @class MediaWikiModule
 * @augments Module
 */
class MediaWikiModule extends Module {
    _request(action, data, transform, method) {
        return this._io.api(method || 'GET', action, data, transform);
    }
    _getQueryBuilder(action) {
        return new QueryBuilder(this._io, this._client, action);
    }
}

module.exports = MediaWikiModule;