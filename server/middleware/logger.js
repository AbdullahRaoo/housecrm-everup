import { logService } from "../services/logService.js";

/**
 * Middleware to log API activities
 */
export const logActivity = (entityType = "SYSTEM") => {
  return (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;

    // Override the end method
    res.end = function (...args) {
      // Get the original end method result
      const result = originalEnd.apply(this, args);

      try {
        // Only log successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const action = determineAction(req.method);

          // Don't log GET operations for entities as they're too frequent
          // But do log system/summary type GET operations
          if (action !== "VIEW" || entityType === "SYSTEM") {
            const userId = req.user && req.user._id ? req.user._id : null;
            const entityId = req.params.id || null;
            const description = generateDescription(action, entityType, req);

            // Clean up details - remove sensitive data
            const details = {
              method: req.method,
              path: req.path,
              ...(action !== "VIEW" && req.body
                ? { data: sanitizeData(req.body) }
                : {}),
            };

            logService.createLog({
              userId,
              action,
              entityType,
              entityId,
              description,
              details,
              ipAddress: req.ip,
              userAgent: req.get("user-agent"),
            });
          }
        }
      } catch (error) {
        // Don't let logging errors affect the API response
        console.error("Error in logging middleware:", error);
      }

      return result;
    };

    next();
  };
};

/**
 * Manually log an activity
 */
export const logManualActivity = async (req, data) => {
  try {
    const userId = req.user && req.user._id ? req.user._id : null;

    await logService.createLog({
      userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      description: data.description,
      details: data.details || {},
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  } catch (error) {
    console.error("Error logging manual activity:", error);
  }
};

/**
 * Determine action type based on HTTP method
 */
function determineAction(method) {
  switch (method) {
    case "POST":
      return "CREATE";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    case "GET":
    default:
      return "VIEW";
  }
}

/**
 * Generate a human-readable description of the activity
 */
function generateDescription(action, entityType, req) {
  const entityName = entityType.toLowerCase();

  switch (action) {
    case "CREATE":
      return `Created a new ${entityName}`;
    case "UPDATE":
      return `Updated ${entityName} information`;
    case "DELETE":
      return `Deleted ${entityName}`;
    case "VIEW":
      if (req.path.includes("search") || req.path.includes("filter")) {
        return `Searched for ${entityName}s`;
      }
      return `Viewed ${entityName} information`;
    default:
      return `Performed action on ${entityName}`;
  }
}

/**
 * Remove sensitive data before logging
 */
function sanitizeData(data) {
  if (!data) return {};

  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "secret", "credit_card", "ssn"];

  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
}
