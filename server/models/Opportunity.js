import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    budget: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    status: {
      type: String,
      enum: ["Draft", "Proposed", "Accepted", "Rejected", "Expired"],
      default: "Draft",
    },
    incomeScenarios: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        income: {
          type: Number,
          required: true,
        },
        expenses: {
          type: Number,
          default: 0,
        },
        roi: {
          type: Number,
        },
        probability: {
          type: Number,
          min: 0,
          max: 100,
          default: 50,
        },
        notes: String,
      },
    ],
    validUntil: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
