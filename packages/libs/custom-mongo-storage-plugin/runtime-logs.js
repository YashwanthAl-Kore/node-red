const mongoose = require('mongoose');

const runtimeLogSchema = new mongoose.Schema({
  tenantConfigId: { type: String, required: true },
  id: { type: String },
  nodeName: { type: String },
  nodeId: { type: String },
  nodeType: { type: String },
  startTime: { type: Number },
  endTime: { type: Number },
  nodeIn: { type: mongoose.Schema.Types.Mixed },
  nodeOut: { type: mongoose.Schema.Types.Mixed },
  nodeError: { type: mongoose.Schema.Types.Mixed }
});
const RuntimeLogs = mongoose.model('runtime_logs', runtimeLogSchema);
module.exports = RuntimeLogs;
