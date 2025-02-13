const { databaseConnection } = require('../utils/connection');
const { mongoose } = require('mongoose');
const { generateNodeId } = require('../packages/node_modules/node-red-utils');
const subFlows = require('../seedData/subFlows.json');
const seedSubFlows = async () => {
  await databaseConnection();
  const tenantConfigModel = mongoose.connection.collection(
    'tenant_configurations'
  );
  const tenants = await tenantConfigModel.find({});
  for (const tenant of tenants) {
    if (tenant.populated_subflows) {
      continue;
    }
    //get subflows and add subflows to db and update the flag
  }
};
