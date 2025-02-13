const { redisClient } = require('../../node_modules/node-red/utils/redis');
const safeJSONStringify = require('json-stringify-safe');

class CustomRedisContext {
    constructor(config) {
        this.client = redisClient;
    }

    open(callback) {
        if (typeof callback === 'function') {
            callback();
        }
        return Promise.resolve();
    }

    async get(scope, key, contextData, callback) {
        try {
            const redisKey = this.getIsolatedKey(scope, key, contextData);
            const result = await this.client.get(redisKey);
            const value = result ? JSON.parse(result) : undefined;
            if (typeof callback === 'function') {
                callback(null, value);
            }
            return value;
        } catch(err) {
            if (typeof callback === 'function') {
                callback(err);
            }
            throw err;
        }
    }

    async set(scope, key, value, contextData, callback) {
        try {
            const redisKey = this.getIsolatedKey(scope, key, contextData);
            const stringValue = safeJSONStringify(value);
            await this.client.set(redisKey, stringValue);
            if (typeof callback === 'function') {
                callback(null);
            }
        } catch(err) {
            if (typeof callback === 'function') {
                callback(err);
            }
            throw err;
        }
    }

    async keys(scope, contextData, callback) {
        try {
            const pattern = this.getIsolatedKey(scope, '*', contextData);
            const keys = await this.client.keys(pattern);
            const result = keys.map(key => this.stripIsolationPrefix(key, scope, contextData));
            
            if (typeof callback === 'function') {
                callback(null, result);
            }
            return result;
        } catch(err) {
            if (typeof callback === 'function') {
                callback(err);
            }
            throw err;
        }
    }

    async delete(scope, contextData) {
        try {
            const pattern = this.getIsolatedKey(scope, '*', contextData);
            const keys = await this.client.keys(pattern);
            
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        } catch(err) {
            throw err;
        }
    }

    clean(activeNodes) {
        return Promise.resolve();
    }

    close(callback) {
        if (typeof callback === 'function') {
            callback();
        }
        return Promise.resolve();
    }

    getIsolatedKey(scope, key, contextData) {
        const tenantId = contextData?.tenantConfigId || '';
        const appId = contextData?.appId || '';
        console.log("getIsolatedKey contextData ", contextData);
        if (tenantId && appId) {
            return `${tenantId}_${appId}:${scope}:${key}`;
        } else if (tenantId) {
            return `${tenantId}:${scope}:${key}`;
        }
        return `${scope}:${key}`;
    }

    stripIsolationPrefix(key, scope, contextData) {
        const tenantId = contextData?.tenantConfigId;
        const appId = contextData?.appId;
        
        let strippedKey = key;
        if (tenantId && appId) {
            strippedKey = strippedKey.slice((tenantId + '_' + appId).length + 1);
        } else if (tenantId) {
            strippedKey = strippedKey.slice(tenantId.length + 1);
        }
        return strippedKey.slice(scope.length + 1);
    }
}

module.exports = function(config) {
    return new CustomRedisContext(config);
}; 