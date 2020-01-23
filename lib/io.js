/**
 * io.js
 * 
 * HTTP module for the library
 */
'use strict';

/**
 * Importing modules
 */
const util = require('./util.js');

/**
 * Importing modules
 */
const http = require('request-promise-native'),
      pack = require('../package.json');

class IO {
    constructor(wiki, language, domain) {
        this._jar = http.jar();
        this._wiki = wiki;
        this._url = util.wikiUrl(wiki, language, domain);
    }
    _request(method, url, qs, transform, body, form) {
        return http({
            headers: {
                'User-Agent': `${pack.name} v${pack.version}`
            },
            method,
            uri: url,
            qs,
            transform,
            body,
            json: !form,
            jar: this._jar,
            form
        });
    }
    get(url, qs, transform) {
        return this._request('GET', url, qs, transform);
    }
    post(url, qs, transform, body) {
        return this._request('POST', url, qs, transform, body);
    }
    put(url, qs, transform) {
        return this._request('PUT', url, qs, transform);
    }
    delete(url, qs, transform) {
        return this._request('DELETE', url, qs, transform);
    }
    api(method, action, data, transform) {
        return new Promise((function(resolve, reject) {
            const requestData = Object.assign({
                action: action,
                format: 'json'
            }, data);
            this._request(
                method,
                `${this._url}/api.php`,
                method === 'GET' ? requestData : {},
                undefined,
                undefined,
                method === 'POST' ? requestData : {}
            ).then(function(d1) {
                const d = typeof d1 === 'string' ? JSON.parse(d1) : d;
                if (!d) {
                    reject({ type: 'nodata' });
                } else if (d.error) {
                    reject(Object.assign({ type: 'api' }, d.error));
                } else {
                    let res;
                    if (!d[action]) {
                        reject({ type: 'nodata' });
                    } else if (typeof transform === 'function') {
                        res = transform(d[action]);
                    } else {
                        res = d[action];
                    }
                    if (res) {
                        res = {data: res};
                        if (d.warnings) {
                            res.warnings = d.warnings;
                        }
                        if (d['query-continue']) {
                            res.continue = d['query-continue'];
                        }
                        resolve(res);
                    }
                }
            }).catch(e => reject({ type: 'http', error: e }));
        }).bind(this));
    }
    nirvana(httpMethod, controller, method, data, transform) {
        return this._request(
            httpMethod,
            `${this._url}/wikia.php`,
            Object.assign({
                controller: controller,
                method: method || 'index',
                format: 'json'
            }, data),
            transform
        );
    }
    ajax(httpMethod, controller, method, data, transform) {
        if (!controller.endsWith('Ajax')) {
            controller += 'Ajax';
        }
        return this._request(
            httpMethod,
            `${this._url}/index.php`,
            Object.assign({
                action: 'ajax',
                rs: controller,
                method: method
            }, data),
            transform,
            data
        );
    }
    services(httpMethod, service, resource, args, qs, transform, body, form) {
        if (!resource.startsWith('/')) {
            resource = `/${resource}`;
        }
        if (util.type(args) === 'object') {
            util.each(args, (k, v) => resource.replace(`{${k}}`, v), this);
        }
        return this._request(
            httpMethod,
            `https://services.fandom.com/${service}${resource}`,
            qs,
            transform,
            body,
            form
        );
    }
}

module.exports = IO;
