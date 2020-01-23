/**
 * module.js
 * 
 * Base class for API modules
 */
'use strict';

/**
 * Importing modules
 */
const util = require('./util.js');

/**
 * Main class
 * @class Module
 */
class Module {
    constructor(io, client, api, permission) {
        this._io = io;
        this._client = client;
        this._api = api;
        this._permission = permission;
    }
    checkPermission(permission) {
        const p = permission || this._permission;
        return !p || this._client.can(p);
    }
    rejectPermission(permission) {
        return util.rejection(`Client does not have appropriate permission (${
            permission || this._permission
        })`);
    }
}

module.exports = Module;
