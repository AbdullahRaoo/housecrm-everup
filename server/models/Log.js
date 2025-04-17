import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "EXPORT",
        "IMPORT",
        "STATUS_CHANGE",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["USER", "CUSTOMER", "PROPERTY", "OPPORTUNITY", "EVENT", "SYSTEM"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      // No ref because it could be any model
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Add index for better query performance
logSchema.index({ action: 1, entityType: 1, createdAt: -1 });
logSchema.index({ userId: 1 });
logSchema.index({ entityId: 1 });
logSchema.index({ createdAt: -1 });

const Log = mongoose.model("Log", logSchema);

export default Log;
