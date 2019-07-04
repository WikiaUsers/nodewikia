/**
 * main.js
 * 
 * Class managing MediaWiki API modules.
 */
'use strict';

/**
 * Importing modules
 */
const API = require('../api.js');

/**
 * Main class
 * @class MediaWikiAPI
 * @augments API
 */
class MediaWikiAPI extends API {
    constructor(io, client) {
        super(io, client, 'mediawiki', {
            pages: ['pages', 'page'],
            query: ['query'],
            users: ['users', 'user']
            /*files: ['files', 'file'],
            parse: ['parse', 'parser']
            */
        });
    }
}

module.exports = MediaWikiAPI;