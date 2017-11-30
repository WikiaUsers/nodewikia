/**
 * main.js
 * 
 * Class managing action=ajax API modules.
 */
'use strict';

/**
 * Importing modules
 */
const API = require('../api.js');

/**
 * Main class
 * @class AjaxAPI
 * @augments API
 */
class AjaxAPI extends API {
    constructor(io, client) {
        super(io, client, 'ajax', {
            chat: ['chat']
        });
    }
}

module.exports = AjaxAPI;