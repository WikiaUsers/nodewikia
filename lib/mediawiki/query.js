/**
 * query.js
 * 
 * Module handling action=query for MediaWiki API
 */
'use strict';

/**
 * Importing modules
 */
const Module = require('./module.js'),
      util = require('../util.js'),
      DATA = require('./query.json');

/**
 * Main class
 * @class QueryAPIModule
 * @augments MediaWikiModule
 */
class QueryAPIModule extends Module {
    constructor(io, client, api) {
        super(io, client, api);
        util.each(DATA, function(k, v) {
            util.each(v, function(name, data) {
                this[name] = this._generateFunction(name);
                this[data.prefix] = this._generateFunction(data.prefix);
            }, this);
        }, this);
    }
    query(obj, pages, gobj) {
        const builder = this._getQueryBuilder('query'),
              errors = [],
              params = {};
        let warnings = [], generator;
        if (util.type(pages) === 'string') {
            const mod = this.findModule(pages);
            if (mod) {
                generator = pages;
                obj[pages] = gobj || {};
                builder.param('generator', pages);
            } else {
                builder.pages(pages);
            }
        } else {
            builder.pages(pages);
        }
        util.each(obj, function(k, v) {
            const mod = this.findModule(k);
            if (mod) {
                if (k === generator) {
                    mod.prefix = `g${mod.prefix}`;
                }
                const validation = this.validateParams(k, mod, v);
                if (validation.length) {
                    warnings = warnings.concat(validation);
                } else {
                    if (k !== generator) {
                        const type = mod.type;
                        if (!params[type]) {
                            params[type] = [];
                        }
                        params[type].push(mod.name);
                    }
                    builder
                        .prefix(mod.prefix)
                        .params(v);
                }
            } else {
                warnings.push(`Module ${mod} not found`);
            }
        }, this);
        return errors.length ?
            util.rejection(errors) :
            builder
                .prefix('')
                .params(params)
                .transform(function(d) {
                    const warns = d.warnings;
                    if (warns) {
                        d.warnings = warns.concat(warnings);
                    }
                    return d;
                })
                .get();
    }
    findModule(mod) {
        for (let type in DATA) {
            const data = DATA[type];
            for (let name in data) {
                const modData = data[name];
                if (mod === modData.prefix || mod === name) {
                    return Object.assign({ type, name }, modData);
                }
            }
        }
    }
    validateParams(data, params) {
        let warnings = [];
        const prefix = data.prefix;
        if (data.params) {
            for (let i in data.params) {
                if (params[i] && !this.validateParam(i, data, params)) {
                    warnings.push(`Failed to validate ${prefix}${i} parameter`);
                }
            }
        }
        if (data.flags) {
            warnings = warnings.concat(
                data.flags.map(f => this.validateFlag(f, data, params), this)
                          .filter(f => !f)
                          .map(
                              f =>
                                  `Failed to validate flag ${f} in ${data.name}`
                          )
            );
        }
        if (
            data.prop &&
            params.prop &&
            !this.validateValues(params.prop, data.prop)
        ) {
            warnings.push(`Failed to validate ${prefix}prop parameter`);
        }
        if (data.show && params.show) {
            const possible = data.show;
            data.show.forEach(el => possible.push(`!${el}`));
            if (!this.validateValues(params.show, possible)) {
                warnings.push(`Failed to validate ${prefix}show parameter`);
            }
        }
        return warnings;
    }
    validateParam(name, data, params, type) {
        const valid = data.params[name],
              param = params[name];
        switch(type || valid.type) {
            case 'string':
                return util.type(param) === 'string';
            case 'number':
                return !isNaN(Number(param));
            case 'boolean':
                params[name] = Boolean(param);
                return true;
            case 'value':
                return valid.possible.includes(param);
            case 'values':
                return this.validateValues(param, valid.possible);
            case 'multiple':
                for (let i = 0; i < valid.types.length; ++i) {
                    if (!this.validateParam(
                        name, data, params, valid.types[i])
                    ) {
                        return false;
                    }
                }
                return true;
            case 'timestamp':
                return this.validateDate(param);
            case 'array':
                if (util.type(param) === 'string') {
                    params[name] = param.split('|');
                    return true;
                }
                return util.type(param) === 'array';
            default: return false;
        }
    }
    validateFlag(flag, data, params) {
        switch(flag) {
            case 'limit':
                return !params.limit ||
                       params.limit === 'max' ||
                       !isNaN(Number(params.limit));
            case 'namespace':
                // TODO: Find valid namespaces from siteinfo
                return !params.namespace ||
                       util.type(params.namespace) === 'array';
            case 'ascdesc':
                return !params.dir || [
                    'ascending',
                    'descending'
                ].includes(params.dir);
            case 'newold':
                return !params.dir || [
                    'newer',
                    'older'
                ].includes(params.dir);
            case 'startend':
                return (!params.start || this.validateDate(params.start)) &&
                       (!params.end || this.validateDate(params.end));
            case 'lang':
                // TODO: Find valid languages from siteinfo
                return util.type(params.lang) === 'string';
            case 'filterredir':
                return !params.filterredir || [
                    'all',
                    'redirects',
                    'nonredirects'
                ].includes(params.filterredir);
            case 'fromto':
                return (!params.from || util.type(params.from) === 'string') &&
                       (!params.to || util.type(params.to) === 'string');
            case 'user':
            case 'excludeuser':
            case 'title':
            case 'prefix':
                return !params[flag] || util.type(params[flag]) === 'string';
            case 'count':
            case 'redirect':
                if (params[flag]) {
                    params[flag] = Boolean(params[flag]);
                }
                return true;
        }
        return true;
    }
    validateValues(values, possible) {
        if (util.type(values) === 'string') {
            values = values.split('|');
        } else if (util.type(values) !== 'array') {
            return false;
        }
        for (let i = 0; i < values.length; ++i) {
            if (!possible.includes(values[i])) {
                return false;
            }
        }
        return true;
    }
    validateDate(param) {
        return !isNaN(new Date(param).getDate());
    }
    _generateFunction(name) {
        return function(params, pages) {
            return this.query({ [name]: params }, pages);
        }.bind(this);
    }
}

module.exports = QueryAPIModule;