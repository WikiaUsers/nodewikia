/**
 * pages.js
 * 
 * Module for handling page-related MediaWiki API requests.
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('./module.js'),
      util = require('../util.js'),
      fs = require('fs'),
      md5 = require('md5');

/**
 * Main class
 * @class PagesAPIModule
 * @augments MediaWikiModule
 */
class PagesAPIModule extends Module {
    _baseEdit(page, options, summary, conflict, watchlist) {
        const params = {};
        params.title = page;
        if (util.type(options) === 'array') {
            if (options.includes('nocreate')) {
                params.nocreate = true;
            } else if (options.includes('createonly')) {
                params.createonly = true;
            }
            if (options.includes('minor')) {
                params.minor = true;
            } else if (options.includes('notminor')) {
                params.notminor = true;
            }
            if (!options.includes('notbot')) {
                params.bot = true;
            }
        }
        if (util.type(summary) === 'string') {
            params.summary = summary;
        }
        if (util.type(conflict) === 'array' && conflict.length === 2) {
            params.basetimestamp = conflict[0];
            params.starttimestamp = conflict[1];
        }
        return this._getQueryBuilder('edit')
            .params(params)
            .token()
            .watchlist(watchlist);
    }
    edit(page, {
        text, append, prepend, options, section, summary, conflict
    }, watchlist) {
        const params = {};
        if (util.type(section) === 'number' || section === 'new') {
            params.section = section;
        }
        if (util.type(options) === 'array') {
            if (options.includes('md5')) {
                params.md5 = md5(
                    append || prepend ?
                        (append || '') + (prepend || '') :
                        text
                );
            }

        }
        if (util.type(append) === 'string') {
            params.appendtext = append;
        }
        if (util.type(prepend) === 'string') {
            params.prependtext = prepend;
        }
        if (!params.appendtext && !params.prependtext) {
            params.text = text;
        }
        return this._baseEdit(page, options, summary, conflict, watchlist)
            .params(params)
            .post();
    }
    undo(page, rev, after, options, summary, conflict, watchlist) {
        if (util.type(options) !== 'array') {
            watchlist = conflict;
            conflict = summary;
            summary = options;
            options = null;
        }
        if (util.type(summary) !== 'string') {
            watchlist = conflict;
            conflict = summary;
            summary = null;
        }
        if (util.type(conflict !== 'array')) {
            watchlist = conflict;
            conflict = null;
        }
        return this._baseEdit(page, options, summary, conflict, watchlist)
            .params({
                undo: rev,
                undoafter: after
            })
            .post();
    }
    delete(page, reason, watchlist, imagerev) {
        return this._getQueryBuilder('delete')
            .page(page)
            .watchlist(watchlist)
            .params({
                reason: reason,
                oldimage: imagerev
            })
            .token()
            .post();
    }
    undelete(page, reason, timestamps, watchlist) {
        return this._getQueryBuilder('undelete')
            .watchlist(watchlist)
            .params({
                title: page,
                reason: reason,
                timestamps: timestamps
            })
            .token()
            .post();
    }
    rollback(page, user, summary, bot, watchlist) {
        return this._getQueryBuilder('rollback')
            .watchlist(watchlist)
            .params({
                title: page,
                user: user,
                summary: summary,
                markbot: bot ? bot : undefined
            })
            .token()
            .post();
    }
    protect(title, protections, expiry, reason, cascade, watchlist) {
        const protects = [];
        util.each(protections, (k, v) => protects.push(`${k}=${v}`));
        return this._getQueryBuilder('protect')
            .watchlist(watchlist)
            .params({
                title,
                protections: protects,
                expiry: expiry,
                reason: reason,
                cascade: cascade: cascade ? cascade : undefined
            })
            .token()
            .post();
    }
    move(from, to, reason, talk, subpages, noredirect, ignore, watchlist) {
        return this._getQueryBuilder('move')
            .watchlist(watchlist)
            .param(util.type(from) === 'number' ? 'fromid' : 'from', from)
            .params({
                to: to,
                reason: reason,
                movetalk: talk,
                movesubpages: subpages,
                noredirect: noredirect,
                ignorewarnings: ignore
            })
            .token()
            .post();
    }
    purge(pages, revisions, updatelinks) {
        return this._getQueryBuilder('purge')
            .pages(pages)
            .params({
                revids: revisions,
                forcelinkupdate: updatelinks ? updatelinks : undefined
            })
            .post();
    }
    watch(page, unwatch) {
        return this._getQueryBuilder('watch')
            .param({
                title: page,
                unwatch: unwatch ? unwatch : undefined
            })
            .token('watch')
            .post();
    }
    import(source, type, page, history, templates, namespace) {
        const builder = this._getQueryBuilder('import').token('import');
        if (type === 'wiki') {
            return builder.params({
                interwikisource: source,
                interwikipage: page,
                fullhistory: history ? history : undefined,
                templates: templates ? templates : undefined,
                namespace: Number(namespace)
            }).post();
        } else {
            const req = builder.post();
            req.form().append(
                'xml',
                type === 'text' ? source : fs.createReadStream(source),
                { contentType: 'text/xml' }
            );
            return req;
        }
        
    }
    compare(from, to) {
        return this._getQueryBuilder('compare')
            .params({
                [`from${util.type(from) === 'number' ? 'rev' : 'title'}`]: from,
                [`to${util.type(to) === 'number' ? 'rev' : 'title'}`]: to
            })
            .get();
    }
}

module.exports = PagesAPIModule;
