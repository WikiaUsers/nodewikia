/**
 * client.js
 * 
 * API client for Wikia and MediaWiki API
 */
'use strict';

/**
 * Importing modules
 */
const path = require('path'),
      IO = require('./io.js'),
      {EventEmitter} = require('events');

/**
 * Constants
 */
const SUBDOMAIN_REGEX = /^[a-zA-Z0-9\.\-]+$/i,
      MODULES = ['mediawiki', 'ajax', 'services'/*, 'nirvana'*/];

/**
 * Main class
 * @class Client
 */
class Client extends EventEmitter {
    constructor(config) {
        super();
        if (typeof config === 'string') {
            try {
                config = require(
                    path.resolve(path.dirname(require.main.filename), config)
                );
            } catch(e) {
                throw new Error('Configuration unable to load');
            }
        } else if (typeof config !== 'object') {
            throw new Error('Configuration invalid');
        }
        if (typeof config.username !== 'string') {
            throw new Error('Username missing or invalid');
        }
        if (typeof config.password !== 'string') {
            throw new Error('Password missing or invalid');
        }
        if (
            typeof config.wiki !== 'string' ||
            !SUBDOMAIN_REGEX.test(config.wiki)
        ) {
            // TODO: Attempt to "fix" wiki subdomain
            throw new Error('Wiki subdomain missing or invalid');
        }
        this._wiki = config.wiki;
        this._io = new IO(config.wiki, config.language, config.domain);
        MODULES.forEach(function(m) {
            const Class = require(`./${m}/main.js`);
            this[m] = new Class(this._io, this);
        }, this);
        this.login(config.username, config.password);
    }
    login(username, password) {
        this.services.auth.login(username, password).then((function(d) {
            this._token = d.access_token;
            this._id = Number(d.user_id);
            return this.fetchInfo();
        }).bind(this));
    }
    fetchInfo() {
        return this.mediawiki.query.query({
            userinfo: {
                prop: 'rights'
            },
            info: {
                token: 'edit'
            },
            users: {
                users: 'Sannse',
                token: 'userrights'
            }
        }, ['#']).then((function({data}) {
            if (data.userinfo.anon !== '') {
                this._name = data.userinfo.name;
            }
            const token = data.pages[-1].edittoken;
            // TODO: Fetch tokens separately?
            this._tokens = {
                edit: token,
                move: token,
                protect: token,
                delete: token,
                userrights: data.users[0].userrightstoken
            };
            this.emit('ready');
        }).bind(this));
    }
    can(permission) { // jshint ignore: line
        // TODO
        return true;
    }
    token(name) {
        return this._tokens[name || 'edit'];
    }
    get loggedIn() {
        return true;
    }
}

module.exports = Client;
