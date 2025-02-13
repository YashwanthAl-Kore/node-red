const mongoose = require('mongoose');

/**
 * Get the mongoose connection instance
 * @returns {mongoose.Connection}
 */
const getMongoConnection = () => {
  return mongoose.connection;
};

/**
 * Run a MongoDB transaction
 * @param {Function} cb - Callback function to execute within transaction
 * @param {Object} options - Transaction options
 * @returns {Promise<any>}
 */
const runTransaction = async (cb, options = {}) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    // If not in production, just run the callback without transaction
    if (!isProduction) {
      return await cb(null);
    }

    const conn = getMongoConnection();
    const buildInfo = await conn.db.admin().buildInfo();
    const isTransactionSupported =
      buildInfo.version >= '4.0.0' &&
      conn.client.topology.constructor.name !== 'Single';

    if (!isTransactionSupported) {
      return await cb(null);
    }

    const session = await mongoose.startSession();
    let result;

    try {
      await session.startTransaction(options);
      result = await cb(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    return result;
  } catch (error) {
    console.error('Error checking transaction support:', error);
    return await cb(null);
  }
};

module.exports = {
  getMongoConnection,
  runTransaction
};
