const mongoose = require('mongoose');
const TenantConfigSchema = new mongoose.Schema({
  accountId: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  name: { type: String, required: true },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number },
  redactConfig: {
    nonRedactableKeys: { type: Array },
    enable: { type: Boolean },
    valuePattern: { type: Array },
    keyPattern: { type: Array }
  },
  runTimeLogs: {
    removableKeys: { type: Array }
  }
});

module.exports = mongoose.model('tenant_configs', TenantConfigSchema);
