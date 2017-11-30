/**
 * chat.js
 * 
 * Module for handling Chat ajax endpoint requests.
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('./module.js'),
      util = require('../util.js');

/**
 * Main class
 * @class ChatAjaxModule
 * @augments AjaxModule
 */
class ChatAjaxModule extends Module {
    constructor(io, client, api) {
        super(io, client, api, 'chat', 'ChatAjax');
    }
    getPrivateRoomID(users) {
        return this._request('getPrivateRoomId', {
            users: users
        }, d => d.id);
    }
    getPMID(users) {
        return this.getPrivateRoomID(users);
    }
    _blockOrBan(user, priv, add, time, reason) {
        return this._request('blockOrBanChat', {
            [util.type(user) === 'number' ? 'userToBanId' : 'userToBan']: user,
            mode: priv ? 'private' : 'global',
            dir: add ? 'add' : 'remove',
            time: time,
            reason: reason,
            token: this._client.token('edit')
        }, d => d);
    }
    block(user) {
        return this._blockOrBan(user, true, true);
    }
    unblock(user) {
        return this._blockOrBan(user, true, false);
    }
    ban(user, time, reason) {
        return this._blockOrBan(user, false, true, time, reason);
    }
    unban(user, reason) {
        return this._blockOrBan(user, false, false, 0, reason);
    }
    getBlocks() {
        return this._request('getPrivateBlocks', {}, function(d) {
            return {
                blocked: d.blockedChatUsers,
                blockedBy: d.blockedByChatUsers
            };
        });
    }
}

module.exports = ChatAjaxModule;