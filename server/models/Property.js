import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Apartment", "House", "Commercial", "Land"],
    },
    purpose: {
      type: String,
      required: true,
      enum: ["Sale", "Rent"],
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    features: {
      bedrooms: Number,
      bathrooms: Number,
      area: Number, // in sq ft/meters
      yearBuilt: Number,
      hasParking: Boolean,
      hasGarden: Boolean,
      hasPool: Boolean,
      isFurnished: Boolean,
      otherAmenities: [String],
    },
    media: {
      photos: [String], // URLs to images
      videos: [String],
      virtualTour: String,
    },
    status: {
      type: String,
      enum: ["Available", "Sold", "Rented", "Pending"],
      default: "Available",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statistics: {
      views: {
        type: Number,
        default: 0,
      },
      inquiries: {
        type: Number,
        default: 0,
      },
      visits: {
        type: Number,
        default: 0,
      },
      offers: [
        {
          amount: Number,
          date: Date,
          customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
          },
          status: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected", "Withdrawn"],
            default: "Pending",
          },
        },
      ],
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

const Property = mongoose.model("Property", propertySchema);

export default Property;
