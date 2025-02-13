const mongoose = require('mongoose');

const nodeMetricsSchema = new mongoose.Schema({
  tenantConfigId: { type: String, required: true },
  appId: { type: String, required: true },
  nodeId: { type: String, required: true },
  messageId: { type: String },
  event: { type: String, required: true },
  timestamp: { type: Number, required: true },
  value: { type: mongoose.Schema.Types.Mixed },
  nodeType: { type: String },
  flowId: { type: String },
  isStartNode: { type: Boolean },
  isEndNode: { type: Boolean },
  executionId: { type: String },
  triggeredBy: { type: String },
  error: { type: String }
});

nodeMetricsSchema.index({ tenantConfigId: 1, appId: 1, timestamp: -1 });
nodeMetricsSchema.index({ nodeId: 1, event: 1 });

const NodeMetrics = mongoose.model('node_metrics', nodeMetricsSchema);
module.exports = NodeMetrics;
