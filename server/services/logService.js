import Log from "../models/Log.js";

/**
 * Service to handle all logging operations
 */
export const logService = {
  /**
   * Create a new log entry
   * @param {Object} logData - Data for the log entry
   * @returns {Promise<Object>} Created log entry
   */
  async createLog(logData) {
    try {
      const log = new Log(logData);
      return await log.save();
    } catch (error) {
      console.error("Error creating log entry:", error);
      // We don't want logging errors to break the application flow
      // so we just log the error and return null
      return null;
    }
  },

  /**
   * Get logs with pagination and filtering
   * @param {Object} options - Query options (filters, pagination)
   * @returns {Promise<Object>} Logs with pagination info
   */
  async getLogs({
    page = 1,
    limit = 50,
    userId,
    action,
    entityType,
    entityId,
    startDate,
    endDate,
    searchTerm,
  }) {
    try {
      const query = {};

      // Apply filters
      if (userId) query.userId = userId;
      if (action) query.action = action;
      if (entityType) query.entityType = entityType;
      if (entityId) query.entityId = entityId;

      // Date range filter
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Search in description
      if (searchTerm) {
        query.description = { $regex: searchTerm, $options: "i" };
      }

      // Count total documents for pagination
      const total = await Log.countDocuments(query);

      // Get paginated results
      const logs = await Log.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "name email")
        .lean();

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  },

  /**
   * Get log summary statistics
   * @returns {Promise<Object>} Summary stats
   */
  async getLogStats() {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalLogs,
        todayLogs,
        weekLogs,
        monthLogs,
        actionStats,
        entityStats,
      ] = await Promise.all([
        Log.countDocuments(),
        Log.countDocuments({ createdAt: { $gte: todayStart } }),
        Log.countDocuments({ createdAt: { $gte: weekStart } }),
        Log.countDocuments({ createdAt: { $gte: monthStart } }),
        Log.aggregate([
          { $group: { _id: "$action", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Log.aggregate([
          { $group: { _id: "$entityType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      return {
        total: totalLogs,
        today: todayLogs,
        thisWeek: weekLogs,
        thisMonth: monthLogs,
        byAction: actionStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byEntityType: entityStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error("Error getting log statistics:", error);
      throw error;
    }
  },

  /**
   * Clear logs older than the specified number of days
   * @param {Number} days - Days to keep logs for
   * @returns {Promise<Number>} Number of deleted logs
   */
  async clearOldLogs(days = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await Log.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      return result.deletedCount;
    } catch (error) {
      console.error("Error clearing old logs:", error);
      throw error;
    }
  },
};
