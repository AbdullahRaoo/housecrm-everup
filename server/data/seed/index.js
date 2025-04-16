import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import connectDB from "../../config/db.js";
import Customer from "../../models/Customer.js";
import Event from "../../models/Event.js";
import Property from "../../models/Property.js";
import User from "../../models/User.js";
import { customers } from "./customers.js";
import { events } from "./events.js";
import { properties } from "./properties.js";
import { users } from "./users.js";

// Determine if this file is being run directly
const isMainModule = fileURLToPath(import.meta.url) === process.argv[1];

// Load environment variables
dotenv.config();

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany();
    await Customer.deleteMany();
    await Property.deleteMany();
    await Event.deleteMany();

    console.log("Database cleared.");

    // Insert users
    console.log("Seeding users...");
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users seeded.`);

    // Insert customers
    console.log("Seeding customers...");
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`${createdCustomers.length} customers seeded.`);

    // Attach users to properties before seeding
    const adminUser = createdUsers.find((user) => user.isAdmin);
    const agentUser = createdUsers.find((user) => user.role === "agent");

    const propertiesWithUsers = properties.map((property) => {
      return {
        ...property,
        owner: adminUser._id,
        agent: agentUser._id,
      };
    });

    // Insert properties
    console.log("Seeding properties...");
    const createdProperties = await Property.insertMany(propertiesWithUsers);
    console.log(`${createdProperties.length} properties seeded.`);

    // Connect events with customers and properties
    const eventsWithReferences = events.map((event, index) => {
      // Cycle through customers and properties
      const customerIndex = index % createdCustomers.length;
      const propertyIndex = index % createdProperties.length;

      return {
        ...event,
        customerId: createdCustomers[customerIndex]._id,
        propertyId: createdProperties[propertyIndex]._id,
      };
    });

    // Insert events
    console.log("Seeding calendar events...");
    const createdEvents = await Event.insertMany(eventsWithReferences);
    console.log(`${createdEvents.length} calendar events seeded.`);

    console.log("Database seeding complete!");

    // If called directly, close the connection
    if (isMainModule) {
      await mongoose.connection.close();
      console.log("Database connection closed.");
    }

    return {
      users: createdUsers,
      customers: createdCustomers,
      properties: createdProperties,
      events: createdEvents,
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    // Close the connection in case of error
    await mongoose.connection.close();
    process.exit(1);
  }
};

// If this file is being run directly, run the seeder
if (isMainModule) {
  seedDatabase();
}

export default seedDatabase;
