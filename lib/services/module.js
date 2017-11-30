/**
 * module.js
 * 
 * Base class for service API modules.
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('../module');

/**
 * Main class
 * @class ServiceModule
 * @augments Module
 */
class ServiceModule extends Module {
    constructor(io, client, api, type) {
        super(io, client, api);
        this._type = type;
    }
    _request(http, path, args, qs, transform, body) {
        return this._io.services(http, this._type, path, args, qs, transform, body);
    }
}

module.exports = ServiceModule;