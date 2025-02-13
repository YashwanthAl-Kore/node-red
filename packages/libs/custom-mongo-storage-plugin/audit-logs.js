const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({
  tenantConfigId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.Mixed },
  event: { type: String, required: true },
  path: { type: String },
  timestamp: { type: Number },
  ip: { type: String },
  message: { type: String },
  userAgent: { type: String }
});
const audit_logs = mongoose.model('audit_Logs', auditLogSchema);
module.exports = audit_logs;
