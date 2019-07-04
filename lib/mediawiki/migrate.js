'use strict';
/*
{
    "prefix": "pr",
    "prop": [],
    "show": [],
    "flags": [
        "limit",
        "nolimit",
        "generator",
        "namespace",
        "ascdesc",
        "newold",
        "startend",
        "lang",
        "filterredir",
        "fromto",
        "user",
        "excludeuser",
        "count",
        "redirect",
        "title",
        "prefix"
    ],
    "continue": true,
    "params": {
        "name": {
            "type": "string|number|boolean|value|values|multiple|timestamp|array",
            "possible": ["only", "for", "value", "and", "values"],
            "eltype": "only for array",
            "types": ["only", "for", "multiple"],
            "require": ["param"],
            "required": true/false
        }
    }
}
*/

const data = require('./query2.json'),
      fs = require('fs'),
      TYPES = ['string', 'number', 'boolean', 'value', 'values', 'multiple', 'timestamp', 'array'];

for (let i in data) {
    const data1 = data[i];
    for (let j in data1) {
        const data2 = data1[j],
              flags = [];
        if (data2.params && typeof data2.params === 'object') {
            for (let f in data2.params) {
                const param = data2.params[f],
                      t = param.type;
                if (!TYPES.includes(t)) {
                    console.log(`Invalid data type for ${j}!`);
                    break;
                }
                for (let g in param) {
                    const v = param[g];
                    switch(g) {
                        case 'type': break;
                        case 'possible':
                            if (t === 'value' || t === 'values' || t === 'multiple') {
                                if (!(v instanceof Array)) {
                                    console.log(`Incorrect parameter type in ${j}.${f}`);
                                }
                            } else {
                                console.log(`Unkown property ${g} for ${j}.${f}`);
                            }
                            break;
                        case 'eltype':
                            if (t === 'array') {
                                if (typeof v !== 'string') {
                                    console.log(`Incorrect parameter type in ${j}.${f}`);
                                }
                            } else {
                                console.log(`Unkown property ${g} for ${j}.${f}`);
                            }
                            break;
                        case 'types':
                            if (t === 'multiple') {
                                if (!(v instanceof Array)) {
                                    console.log(`Incorrect parameter type in ${j}.${f}`);
                                }
                            } else {
                                console.log(`Unkown property ${g} for ${j}.${f}`);
                            }
                            break;
                        case 'require':
                            if (!(v instanceof Array)) {
                                console.log(`Incorrect parameter type in ${j}.${f}`);
                            }
                            break;
                        case 'required':
                            if (typeof v !== 'boolean') {
                                console.log(`Incorrect parameter type in ${j}.${f}`);
                            }
                            break;
                        default:
                            console.log(`Unkown property ${g} for ${j}.${f}`);
                    }
                }
            }
            // Migrate prop
            const prop = data2.params.prop;
            if (prop && prop.type === 'values' && prop.possible instanceof Array) {
                data2.prop = prop.possible;
                delete data2.params.prop;
            }
            // Migrate show
            const show = data2.params.show;
            if (show && (show.type === 'values' || show.type === 'value') && show.possible instanceof Array) {
                data2.show = show.possible.filter(el => !el.startsWith('!'));
                delete data2.params.show;
            }
            // Migrate newold
            const dir = data2.params.dir;
            if (dir && dir.type === 'value' && dir.possible.includes('newer') && dir.possible.includes('older')) {
                flags.push('newold');
                delete data2.params.dir;
            }
            // Migrate startend
            const start = data2.params.start,
                  end = data2.params.end;
            if (end && end.type === 'timestamp' && ((start && start.type === 'timestamp') || data2.continue === 'start')) {
                flags.push('startend');
                delete data2.params.start;
                delete data2.params.end;
            }
            // Migrate lang
            const lang = data2.params.lang;
            if (lang && lang.type === 'string') {
                flags.push('lang');
                delete data2.params.lang;
            }
            // Migrate filterredir
            const filterredir = data2.params.filterredir;
            if (filterredir && filterredir.type === 'values' && filterredir.possible.length === 3) {
                flags.push('filterredir');
                delete data2.params.filterredir;
            }
            // Migrate fromto
            const from = data2.params.from,
                  to = data2.params.to;
            if (to && to.type === 'string' && ((from && from.type === 'timestamp') || data2.continue === 'from')) {
                flags.push('fromto');
                delete data2.params.from;
                delete data2.params.to;
            }
            // Migrate user
            const user = data2.params.user;
            if (user && user.type === 'string') {
                flags.push('user');
                delete data2.params.user;
            }
            // Migrate excludeuser
            const excludeuser = data2.params.excludeuser;
            if (excludeuser && excludeuser.type === 'string') {
                flags.push('excludeuser');
                delete data2.params.excludeuser;
            }
            // Migrate count
            const count = data2.params.count;
            if (count && count.type === 'boolean') {
                flags.push('count');
                delete data2.params.count;
            }
            // Migrate redirect
            const redirect = data2.params.redirect;
            if (redirect && redirect.type === 'boolean') {
                flags.push('redirect');
                delete data2.params.redirect;
            }
            // Migrate title
            const title = data2.params.title;
            if (title && title.type === 'string') {
                flags.push('title');
                delete data2.params.title;
            }
            // Migrate prefix
            const prefix = data2.params.prefix;
            if (prefix && prefix.type === 'string') {
                flags.push('prefix');
                delete data2.params.prefix;
            }
        }
        // Migrate limit/nolimit
        if (data2.continue && !data2.limit) {
            flags.push('nolimit');
        } else if (!data2.continue && data2.limit) {
            flags.push('limit');
            delete data2.limit;
        }
        // Migrate generator
        if (data2.generator) {
            flags.push('generator');
            delete data2.generator;
        }
        // Migrate namespace
        if (data2.namespace) {
            flags.push('namespace');
            delete data2.namespace;
        }
        // Migrate ascdesc
        if (data2.dir) {
            flags.push('ascdesc');
            delete data2.dir;
        }
        // Add flags
        if (flags.length > 0) {
            data2.flags = flags;
        }
    }
}

fs.writeFileSync('query.json', JSON.stringify(data, null, '    '));