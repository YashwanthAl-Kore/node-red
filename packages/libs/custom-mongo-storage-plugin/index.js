const mongoose = require('mongoose');
const Flows = require('./flows');
const Task = require('./tasks');
const subFlows = require('../../../seedData/subFlows.json');
const logger = require('../../node_modules/node-red/utils/pino-logger');
const AuditLogs = require('./audit-logs');
const RuntimeLogs = require('./runtime-logs');
const AppConfig = require('./appConfig');
const NodeDrafts = require('./drafts');

const NodeMetrics = require('./metrics');

function getMaxTimeMs() {
  return parseInt(process.env.MAX_TIME_MS || 1000);
}

const { redisClient } = require('../../node_modules/node-red/utils/redis');
const RuntimeLogsSummary = require('./runttime-logs-summary');

var storageModule = {
  init: function (settings) {
    if (
      settings.storageModuleOptions == null ||
      settings.storageModuleOptions.mongoUrl == null ||
      settings.storageModuleOptions.database == null
    ) {
      throw new Error(
        "mongo storage module's required parameters are not defined"
      );
    }
    const mongoURL = settings.storageModuleOptions.mongoUrl;
    const mongooseOptions = settings.storageModuleOptions.mongooseOptions;
    return mongoose.connect(mongoURL, mongooseOptions);
  },

  getFlows: async function (tenantConfigId, appId, appType) {
    let query = {};
    if (tenantConfigId) {
      query.tenantConfigId = tenantConfigId;
    }
    if (appType) {
      query.appType = appType;
    }

    try {
      if (appId) {
        const app = await AppConfig.findOne({ _id: appId });
        if (!app) {
          throw new Error('App not found');
        }
        query.appId = appId;
      }
      const flows = await Flows.find(query).maxTimeMS(getMaxTimeMs());
      return flows.map(_flow => {
        const { _id, __v, recStatus, ...flow } = _flow.toJSON();
        return flow;
      });
    } catch (error) {
      logger.error('Error fetching flows:', error);
      throw error;
    }
  },

  deleteFlows: async function (tenantConfigId, appId, appType) {
    let query = {};
    if (appType) {
      query.appType = appType;
    }
    if (appId) {
      const app = await AppConfig.findOne({ _id: appId });
      if (!app) {
        throw new Error('App not found');
      }
      query.appId = appId;
    }
    if (tenantConfigId) {
      query.tenantConfigId = tenantConfigId;
      query.isPopulated = { $ne: true };
    }
    try {
      return await Flows.deleteMany(query);
    } catch (error) {
      logger.error('Error fetching flows:', error);
      throw error;
    }
  },

  saveFlows: async function (flows, tenantConfigId, emailId, appId, appType) {
    try {
      const { maskId } = await AppConfig.findOne({ _id: appId }).maxTimeMS(
        getMaxTimeMs()
      );
      await this.deleteFlows(tenantConfigId, appId, appType);
      const _flows = flows.map(flow => ({
        ...flow,
        tenantConfigId,
        appId,
        appType,
        maskId,
        createdBy: emailId
      }));
      await Flows.insertMany(_flows);
    } catch (error) {
      logger.error('Error saving flows:', error);
      throw error;
    }
  },
  updateFlowsRecords: async function (tenantConfigId, appId, updateValue) {
    let query = {
      appId,
      tenantConfigId
    }
    try {
      let wait = [Flows.updateMany(query, { $set: updateValue }), NodeDrafts.updateMany(query, { $set: updateValue })]
      return await Promise.all(wait)
    } catch (error) {
      logger.error('Error updating flows:', error);
      throw error;
    }
  },
  getDrafts: async function (tenantConfigId, appId, appType) {
    if (!tenantConfigId || !appId || !appType) {
      logger.error('Called getDrafts without tenantConfigid or appid or appType');
      throw Error('tenantConfigid, appid and appType required');
    }
    const query = { tenantConfigId, appId, appType };

    try {
      if (appId) {
        const app = await AppConfig.findOne({ _id: appId });
        if (!app) {
          throw new Error('App not found');
        }
      }
      const flows = await NodeDrafts.find(query).maxTimeMS(getMaxTimeMs());
      return flows.map(_flow => {
        const { _id, __v, recStatus, ...flow } = _flow.toJSON();
        return flow;
      });
    } catch (error) {
      logger.error('Error fetching flows:', error);
      throw error;
    }
  },

  saveDrafts: async function (flows, tenantConfigId, emailId, appId, appType) {
    try {
      await this.deleteDrafts(tenantConfigId, appId, appType);
      const _flows = flows.map(flow => ({
        ...flow,
        tenantConfigId,
        appId,
        appType,
        createdBy: emailId
      }));
      await NodeDrafts.insertMany(_flows);
    } catch (error) {
      logger.error('Error saving flows:', error);
      throw error;
    }
  },

  deleteDrafts: async function (tenantConfigId, appId, appType) {
    if (!tenantConfigId || !appId) {
      logger.error('Called delete drafts without tenantConfigid or appid ');
      throw Error('tenantConfigid and appid required');
    }
    const query = { tenantConfigId, appId, appType };

    try {
      return await NodeDrafts.deleteMany(query);
    } catch (error) {
      logger.error('Error deleting flows:', error);
      throw error;
    }
  },

  saveAuditLogs: async function (logRecord) {
    try {
      await AuditLogs.create(logRecord);
    } catch (error) {
      logger.error('Error while saving the audit logs', error);
    }
  },

  saveRuntimeLogs: async function (logRecord) {
    try {
      await RuntimeLogs.create(logRecord);
    } catch (error) {
      logger.error('Error while saving the run time logs', error);
    }
  },

  updateRuntimeLogsSummary: async function (filter, logRecord, options) {
    try {
      await RuntimeLogsSummary.updateOne(
        filter,
        { $set: logRecord },
        options,
      );
    } catch (error) {
      logger.error('Error while saving the run time logs summary', error);
    }
  },

  saveNodeMetrics: async function (logRecord) {
    try {
      await NodeMetrics.create(logRecord);
    } catch (error) {
      logger.error('Error while saving the node metrics', error);
    }
  },

  getCredentials: function () {
    return Promise.resolve([]);
  },

  saveCredentials: function (credentials) {
    return Promise.resolve([]);
  },

  getSettings: function () {
    return Promise.resolve([]);
  },
  saveSettings: function (settings) {
    return Promise.resolve([]);
  },
  getSessions: function () {
    return Promise.resolve([]);
  },
  saveSessions: function (sessions) {
    return Promise.resolve([]);
  },

  getLibraryEntry: function (type, path) {
    return Promise.resolve([]);
  },

  saveLibraryEntry: function (type, path, meta, body) {
    return Promise.resolve([]);
  },
  Session: {
    set: async function (token, session, expiryTime = 60 * 60 * 24 * 30) {
      return await redisClient.set(token, session, 'EX', expiryTime);
    },
    get: async function (token) {
      return await redisClient.get(token);
    },
    delete: async function (token) {
      return await redisClient.del(token);
    }
  },
  Task: {
    findOne: async function (query) {
      try {
        return await Task.findOne(query).maxTimeMS(getMaxTimeMs());
      } catch (error) {
        console.error('Error finding task:', error);
        throw error;
      }
    },
    updateOne: async function (query, updates, options) {
      try {
        return await Task.updateOne(query, { $set: updates }, options);
      } catch (error) {
        console.error('Error updating task:', error);
        throw error;
      }
    }
  },
  populateSubflows: async function (accountId, createdBy) {
    const subFlowNodes = subFlows.flatMap(subflowArray =>
      subflowArray.map(subflow => ({
        ...subflow,
        accountId,
        createdBy: createdBy,
        isPopulated: true
      }))
    );
    try {
      return await Flows.insertMany(subFlowNodes);
    } catch (error) {
      logger.error('Error while populating subflows:', error);
      throw error;
    }
  },
  getMaskId: async function (appId) {
    const { maskId } = await AppConfig.findById(appId).maxTimeMS(
      getMaxTimeMs()
    );
    return maskId;
  },

  getHttpNodes: async function (tenantConfigId, appId) {
    if (!tenantConfigId || !appId) {
      throw new Error(
        'tennatConfigId and appId are required to get http nodes'
      );
    }

    try {
      const app = await AppConfig.findOne({ _id: appId });
      if (!app) {
        throw new Error('App not found');
      }
      let query = {
        type: 'http in',
        tenantConfigId: tenantConfigId,
        appId: appId
      };

      const flows = await Flows.find(query).maxTimeMS(getMaxTimeMs());
      return flows.map(_flow => {
        const { _id, __v, ...flow } = _flow.toJSON();
        return flow;
      });
    } catch (error) {
      logger.error('Error fetching flows:', error);
      throw error;
    }
  }
};

module.exports = storageModule;
