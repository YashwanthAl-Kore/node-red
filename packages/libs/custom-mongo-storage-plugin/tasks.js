const mongoose = require('mongoose');

const ScheduleItemSchema = new mongoose.Schema({
  topic: { type: String },
  name: { type: String },
  index: { type: Number },
  payloadType: { type: String },
  payload: { type: String },
  limit: { type: mongoose.Schema.Types.Mixed },
  expressionType: { type: String },
  expression: { type: String },
  isDynamic: { type: Boolean },
  modified: { type: Boolean },
  isRunning: { type: Boolean },
  count: { type: Number }
});

const StateSchema = new mongoose.Schema({
  version: { type: Number },
  dynamicSchedules: [ScheduleItemSchema],
  staticSchedules: [ScheduleItemSchema]
});

const TaskSchema = new mongoose.Schema(
  {
    tenantConfigId: { type: String, required: true },
    appId: { type: String, required: true },
    createdBy: { type: String, required: true },
    nodeId: { type: String },
    state: { type: StateSchema },
    z: { type: String, required: true }
  },
  {
    timestamps: { currentTime: () => Math.floor(Date.now()) }
  }
);

const Task = mongoose.model('tasks', TaskSchema);
module.exports = Task;
