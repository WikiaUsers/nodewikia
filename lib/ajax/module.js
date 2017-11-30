/**
 * module.js
 * 
 * Base class for action=ajax API modules
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('../module.js');

/**
 * Main class
 * @class AjaxModule
 * @augments Module
 */
class AjaxModule extends Module {
    constructor(io, client, api, permission, type) {
        super(io, client, api, permission);
        this._type = type;
    }
    _request(method, data, transform, http) {
        return this.checkPermission() ?
            this._io.ajax(http || 'POST', this._type, method, data, transform) :
            this.rejectPermission();
    }
}

module.exports = AjaxModule;