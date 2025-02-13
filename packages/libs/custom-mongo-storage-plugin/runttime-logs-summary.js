const mongoose = require('mongoose');

const runtimeLogsSummarySchema = new mongoose.Schema({
    tenantConfigId: { type: String, required: true },
    id: { type: String, required: true },
    appId: { type: String },
    appName: { type: String },
    appType: { type: String },
    workflowName: { type: String },
    startTime: { type: Number },
    endTime: { type: Number },
    workflowStatus: { type: String }
});

const RuntimeLogsSummary = mongoose.model(
    'runtime_logs_summary',
    runtimeLogsSummarySchema
);

module.exports = RuntimeLogsSummary;
