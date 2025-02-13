const mongoose = require('mongoose');
const AppConfigSchema = new mongoose.Schema({
  tenantConfigId: { type: String, required: true },
  appId: { type: String, required: true, unique: true },
  appSecret: { type: String, required: true },
  appName: { type: String, required: true },
  appDescription: { type: String },
  maskId: { type: String, required: true, unique: true },
  appStatus: {
    type: String,
    required: true,
    default: 'enabled',
    enum: ['enabled', 'disabled']
  },
  createdAt: { type: Number, required: true, default: Date.now },
  updatedAt: { type: Number, required: true, default: Date.now },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  accessType: {
    type: String,
    required: true,
    enum: ['public', 'private', 'protected'],
    default: 'public'
  }
});

module.exports = mongoose.model('apps', AppConfigSchema);
