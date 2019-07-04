/**
 * util.js
 * 
 * Library utilities
 */
'use strict';

/**
 * Main class
 * @class Util
 */
class Util {
    static wikiUrl(name, language, domain) {
        if (language && language !== 'en') {
            return `https://${name}.${domain || 'fandom.com'}/${language}`;
        }
        return `https://${name}.${domain || 'fandom.com'}`;
    }
    static type(value) {
        const type = typeof value;
        switch (type) {
            case 'string':
            case 'undefined':
            case 'boolean':
            case 'function':
                return type;
            case 'number':
                return isNaN(value) ? 'nan' : 'number';
            case 'object':
                if (value === null) {
                    return 'null';
                } else if (value instanceof Array) {
                    return 'array';
                } else {
                    return 'object';
                }
        }
    }
    static verifyType(arg, type, name) {
        const atype = this.type(arg);
        if (this.type(type) === 'string' && atype !== type) {
            throw new TypeError(`Invalid argument type for ${
                this.type(name) === 'number' ?
                    `argument number ${name}` :
                    `'${name}'`
            }: got ${atype}, expected ${type}.`);
        }
    }
    static verify(args, types) {
        this.verifyType(args, 'object', 'args');
        this.verifyType(types, 'array', 'types');
        types.forEach((t, i) => this.verifyType(args[i], t, i), this);
    }
    static rejection(error) {
        return new Promise(
            (resolve, reject) => reject(new Error(error))
        );
    }
    static each(obj, func, context) {
        this.verify(arguments, ['object', 'function']);
        for (let i in obj) {
            func.call(context, i, obj[i]);
        }
    }
}

module.exports = Util;
