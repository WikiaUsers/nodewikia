/**
 * auth.js
 * 
 * Module for handling Helios service requests.
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('./module.js');

/**
 * Main class
 * @class AuthModule
 * @augments ServiceModule
 * @todo Add other known endpoints
 */
class AuthModule extends Module {
    constructor(io, client, api) {
        super(io, client, api, 'auth');
    }
    login(username, password) {
        return this._request(
            'POST',
            '/token',
            null,
            null,
            null,
            null,
            {username, password}
        );
    }
}

module.exports = AuthModule;
