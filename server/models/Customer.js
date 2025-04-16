import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Lead"],
      default: "Lead",
    },
    notes: {
      type: String,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastInteraction: {
      type: Date,
    },
    propertiesViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    preferences: {
      budget: {
        min: Number,
        max: Number,
      },
      location: [String],
      propertyType: [String],
      features: [String],
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
