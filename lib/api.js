/**
 * api.js
 * 
 * Base class for API packages
 */
'use strict';

/**
 * Importing modules
 */
const util = require('./util.js');

/**
 * Main class
 * @class API
 */
class API {
    constructor(io, client, name, modules) {
        this._io = io;
        this._client = client;
        this._name = name;
        util.each(modules, function(i, mods) {
            const Class = require(`./${name}/${i}.js`),
                  mod = new Class(io, client, this);
            mods.forEach(m => this[m] = mod);
        }, this);
    }
}

module.exports = API;