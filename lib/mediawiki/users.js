/**
 * users.js
 * 
 * Module for handling user-related MediaWiki API requests.
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('./module.js'),
      util = require('../util.js');

/**
 * Main class
 * @class UsersAPIModule
 * @augments MediaWikiModule
 */
class UsersAPIModule extends Module {
    login(name, password, token) {
        this._lgparams = [name, password];
        const query = this._getQueryBuilder('login')
            .prefix('lg')
            .params({name, password})
            .post();
        if (token) {
            query.param('lgtoken', token);
        }
        return query.then(this._login.bind(this));
    }
    _login(d) {
        if (d.data.result === 'NeedToken' && d.data.token) {
            this._lgparams.push(d.data.token);
            return this.login.apply(this, this._lgparams);
        } else if (d.data.result === 'Success') {
            return d;
        } else {
            return util.rejection({
                error: 'login',
                code: d.data.result
            });
        }
    }
    logout() {
        this._getQueryBuilder('logout').post();
    }
    block(user, expiry, reason, flags) {
        if (util.type(reason) === 'array') {
            flags = reason;
            reason = '';
        } else if (!flags) {
            flags = [];
        }
        const params = {user, expiry, reason};
        flags.forEach(f => params[f] = true);
        return this._getQueryBuilder('block')
            .params(params)
            .token()
            .post();
    }
    unblock(user, reason) {
        return this._getQueryBuilder('unblock')
            .params({
                [util.type(user) === 'number' ? 'id': 'user']: user,
                reason
            })
            .token()
            .post();
    }
    userrights(user, add, remove, reason) {
        return this._api.query.users({
            users: user,
            token: 'userrights'
        }).then(function(d) {
            const token = d.data.users[0].userrightstoken;
            return this._getQueryBuilder('userrights')
                .params({user, add, remove, reason, token})
                .post();
        }.bind(this));
        
    }
    rights(user, add, remove, reason) {
        return this.userrights(user, add, remove, reason);
    }
    options(obj, value) {
        if (this._client.loggedIn()) {
            const query = this._getQueryBuilder('options').token('userrights');
            if (obj === 'reset') {
                query.param('reset', true);
            } else if (value) {
                query.params({
                    optionname: obj,
                    optionvalue: value
                });
            } else {
                const opts = [];
                util.each(obj, (k, v) => opts.push(`${k}=${v}`));
                query.param('change', opts);
            }
            return query.post();
        } else {
            return this.rejectPermissions('editmyoptions');
        }
    }
}

module.exports = UsersAPIModule;