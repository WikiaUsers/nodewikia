/**
 * main.js
 * 
 * Class for managing Service API modules.
 */
'use strict';

/**
 * Importing modules
 */
const API = require('../api.js');

/**
 * Main class
 * @class ServiceAPI
 * @augments API
 */
class ServiceAPI extends API {
    constructor(io, client) {
        super(io, client, 'services', {
            auth: ['auth']
        });
    }
}

module.exports = ServiceAPI;