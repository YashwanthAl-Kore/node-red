const GlobalVar = require('custom-mongo-storage-plugin/global-vars');

module.exports = function(config) {
    let runtime;
    
    return {
        name: 'adminGlobals',
        
        open: function(_runtime) {
            runtime = _runtime;
            return Promise.resolve();
        },
        
        async get(scope, key, contextData, callback) {
            try {
                const { tenantConfigId, appId } = contextData;
                
                if (!tenantConfigId) {
                    throw new Error('tenantConfigId not found in request context');
                }

                const result = await GlobalVar.findOne({ tenantConfigId, key });
                callback(null, result ? result.value : undefined);
            } catch(err) {
                console.error('Error in dbGlobals get:', err);
                callback(err);
            }
        },
        
        set: function() {
            return Promise.resolve();
        },
        
        keys: function() {
            return Promise.resolve([]);
        },
        
        close: function() {
            return Promise.resolve();
        }
    }
} 