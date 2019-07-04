/**
 * module.js
 * 
 * Base class for Nirvana modules
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('../module.js');

/**
 * Main class
 * @class NirvanaModule
 * @augments Module
 */
class NirvanaModule extends Module {
    constructor(io, client, api, type) {
        super(io, client, api);
        this._type = type;
    }
    _request(http, method, data, transform) {
        return this._io.nirvana(http, this._type, method, data, transform);
    }
}

module.exports = NirvanaModule;