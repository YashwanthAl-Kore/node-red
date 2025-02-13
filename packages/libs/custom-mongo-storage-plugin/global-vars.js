'use strict';

const mongoose = require('mongoose');

const GlobalVarSchema = new mongoose.Schema({
    tenantConfigId: String,
    key: String,
    value: mongoose.Schema.Types.Mixed,
    createdBy: String,
    updatedBy: String
}, { timestamps: { currentTime: () => Math.floor(Date.now()) } });


const GlobalVar = mongoose.model('admin_global_vars', GlobalVarSchema);

module.exports = GlobalVar; 