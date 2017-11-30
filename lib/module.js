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
        permission = permission || this._permission;
        return !this._permission || this._client.can(this._permission);
    }
    rejectPermission(permission) {
        return util.rejection(`Client does not have appropriate permission (${
            permission || this._permission
        })`);
    }
}

module.exports = Module;