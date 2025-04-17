import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import xlsx from "xlsx";
import Customer from "../models/Customer.js";
import Event from "../models/Event.js";
import Opportunity from "../models/Opportunity.js";
import Property from "../models/Property.js";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const router = express.Router();

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: "Forbidden: Invalid or expired token" });
  }
};

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};

// For backward compatibility during development
const mockAdminCheck = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  // Mock token for development
  const token = authHeader.split(" ")[1];

  if (token === "admin-token") {
    req.user = { isAdmin: true };
    next();
  } else {
    try {
      // Try JWT verification for real tokens
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key_here"
      );
      if (decoded.isAdmin) {
        req.user = decoded;
        next();
      } else {
        return res
          .status(403)
          .json({ error: "Forbidden: Admin access required" });
      }
    } catch (error) {
      return res
        .status(403)
        .json({ error: "Forbidden: Admin access required" });
    }
  }
};

// AUTH ROUTES

// Register a new user
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Create new user (first user is admin for testing purposes)
    const userCount = await User.countDocuments({});
    const isAdmin = userCount === 0; // First registered user is admin

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
      isAdmin,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    // Return user data and token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");
    if (user.password !== hashedPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get user profile
router.get("/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// CALENDAR ROUTES

// GET /api/calendar - Get all calendar events
router.get("/calendar", authenticateToken, async (req, res) => {
  try {
    const events = await Event.find().sort({ start: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
});

// POST /api/calendar - Create a new calendar event
router.post("/calendar", authenticateToken, async (req, res) => {
  try {
    // Process the request body to handle empty values for ObjectId fields
    const eventData = { ...req.body };

    // Convert empty strings to null for ObjectId fields
    if (eventData.propertyId === "") {
      eventData.propertyId = null;
    }

    if (eventData.customerId === "") {
      eventData.customerId = null;
    } else if (eventData.customerId) {
      // Check if customerId is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventData.customerId);
      if (!isValidObjectId) {
        // If not valid ObjectId, try to find customer by name
        try {
          const customer = await Customer.findOne({
            name: eventData.customerId,
          });
          if (customer) {
            eventData.customerId = customer._id;
          } else {
            // If no customer found with that name, set to null
            eventData.customerId = null;
          }
        } catch (err) {
          console.error("Error finding customer by name:", err);
          eventData.customerId = null;
        }
      }
    }

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({ error: "Failed to create calendar event" });
  }
});

// GET /api/calendar/:id - Get a specific calendar event
router.get("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    res.status(500).json({ error: "Failed to fetch calendar event" });
  }
});

// PUT /api/calendar/:id - Update a specific calendar event
router.put("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    // Process the request body to handle empty values for ObjectId fields
    const eventData = { ...req.body };

    // Convert empty strings to null for ObjectId fields
    if (eventData.propertyId === "") {
      eventData.propertyId = null;
    }

    if (eventData.customerId === "") {
      eventData.customerId = null;
    } else if (eventData.customerId) {
      // Check if customerId is a valid ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(eventData.customerId);
      if (!isValidObjectId) {
        // If not valid ObjectId, try to find customer by name
        try {
          const customer = await Customer.findOne({
            name: eventData.customerId,
          });
          if (customer) {
            eventData.customerId = customer._id;
          } else {
            // If no customer found with that name, set to null
            eventData.customerId = null;
          }
        } catch (err) {
          console.error("Error finding customer by name:", err);
          eventData.customerId = null;
        }
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating calendar event:", error);
    res.status(500).json({ error: "Failed to update calendar event" });
  }
});

// DELETE /api/calendar/:id - Delete a specific calendar event
router.delete("/calendar/:id", authenticateToken, async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({ error: "Failed to delete calendar event" });
  }
});

// Export calendar data as Excel - ADMIN ONLY
router.get("/export/calendar/excel", mockAdminCheck, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("propertyId", "title")
      .populate("customerId", "name email");

    // Format data for Excel export
    const exportData = events.map((event) => ({
      "Event ID": event._id.toString(),
      Title: event.title,
      Type: event.type,
      Start: new Date(event.start).toLocaleString(),
      End: new Date(event.end).toLocaleString(),
      Description: event.description || "",
      Property: event.propertyId ? event.propertyId.title : "",
      Customer: event.customerId ? event.customerId.name : "",
      "Customer Email": event.customerId ? event.customerId.email : "",
      Status: event.status,
      "Google Calendar Sync": event.isGoogleCalendarSync ? "Yes" : "No",
    }));

    // Create workbook
    const wb = xlsx.utils.book_new();

    // Add worksheet with data
    const ws = xlsx.utils.json_to_sheet(exportData);
    xlsx.utils.book_append_sheet(wb, ws, "Calendar Events");

    // Set column widths for better readability
    const colWidths = [
      { wch: 24 }, // Event ID
      { wch: 30 }, // Title
      { wch: 15 }, // Type
      { wch: 25 }, // Start
      { wch: 25 }, // End
      { wch: 40 }, // Description
      { wch: 30 }, // Property
      { wch: 30 }, // Customer
      { wch: 30 }, // Customer Email
      { wch: 15 }, // Status
      { wch: 20 }, // Google Calendar Sync
    ];
    ws["!cols"] = colWidths;

    // Create buffer for download
    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="calendar_events.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the file
    res.send(Buffer.from(excelBuffer));
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// Export calendar data as CSV - ADMIN ONLY
router.get("/export/calendar/csv", mockAdminCheck, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("propertyId", "title")
      .populate("customerId", "name email");

    // Format data for CSV export (same as Excel)
    const exportData = events.map((event) => ({
      "Event ID": event._id.toString(),
      Title: event.title,
      Type: event.type,
      Start: new Date(event.start).toLocaleString(),
      End: new Date(event.end).toLocaleString(),
      Description: event.description || "",
      Property: event.propertyId ? event.propertyId.title : "",
      Customer: event.customerId ? event.customerId.name : "",
      "Customer Email": event.customerId ? event.customerId.email : "",
      Status: event.status,
      "Google Calendar Sync": event.isGoogleCalendarSync ? "Yes" : "No",
    }));

    // Create workbook for CSV
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(exportData);
    xlsx.utils.book_append_sheet(wb, ws, "Calendar Events");

    // Generate CSV
    const csvContent = xlsx.utils.sheet_to_csv(ws);

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="calendar_events.csv"'
    );
    res.setHeader("Content-Type", "text/csv");

    // Send the CSV data
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// Filter by client or property - ADMIN ONLY
router.get(
  "/export/calendar/:format/:filterType/:filterId",
  mockAdminCheck,
  async (req, res) => {
    try {
      const { format, filterType, filterId } = req.params;

      // Apply filter based on filterType (client or property)
      let query = {};
      if (filterType === "client") {
        query.customerId = filterId;
      } else if (filterType === "property") {
        query.propertyId = filterId;
      }

      const events = await Event.find(query)
        .populate("propertyId", "title")
        .populate("customerId", "name email");

      // Format data for export
      const exportData = events.map((event) => ({
        "Event ID": event._id.toString(),
        Title: event.title,
        Type: event.type,
        Start: new Date(event.start).toLocaleString(),
        End: new Date(event.end).toLocaleString(),
        Description: event.description || "",
        Property: event.propertyId ? event.propertyId.title : "",
        Customer: event.customerId ? event.customerId.name : "",
        "Customer Email": event.customerId ? event.customerId.email : "",
        Status: event.status,
        "Google Calendar Sync": event.isGoogleCalendarSync ? "Yes" : "No",
      }));

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(exportData);
      xlsx.utils.book_append_sheet(wb, ws, "Filtered Calendar Events");

      // Set column widths for better readability
      const colWidths = [
        { wch: 24 }, // Event ID
        { wch: 30 }, // Title
        { wch: 15 }, // Type
        { wch: 25 }, // Start
        { wch: 25 }, // End
        { wch: 40 }, // Description
        { wch: 30 }, // Property
        { wch: 30 }, // Customer
        { wch: 30 }, // Customer Email
        { wch: 15 }, // Status
        { wch: 20 }, // Google Calendar Sync
      ];
      ws["!cols"] = colWidths;

      if (format === "excel") {
        // Export as Excel
        const excelBuffer = xlsx.write(wb, {
          bookType: "xlsx",
          type: "buffer",
        });

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="calendar_filtered_${filterType}_${filterId}.xlsx"`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(Buffer.from(excelBuffer));
      } else if (format === "csv") {
        // Export as CSV
        const csvContent = xlsx.utils.sheet_to_csv(ws);

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="calendar_filtered_${filterType}_${filterId}.csv"`
        );
        res.setHeader("Content-Type", "text/csv");

        res.send(csvContent);
      } else {
        res
          .status(400)
          .json({ error: 'Invalid export format. Use "excel" or "csv".' });
      }
    } catch (error) {
      console.error("Error exporting filtered data:", error);
      res.status(500).json({ error: "Failed to export filtered data" });
    }
  }
);

// CUSTOMER ROUTES

// Get all customers
router.get("/customers", authenticateToken, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get single customer by ID
router.get("/customers/:id", authenticateToken, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Create new customer
router.post("/customers", authenticateToken, async (req, res) => {
  try {
    // Check if email already exists
    if (req.body.email) {
      const existingCustomer = await Customer.findOne({
        email: req.body.email,
      });
      if (existingCustomer) {
        return res.status(400).json({
          error: "A customer with this email already exists",
          field: "email",
        });
      }
    }

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        error: "Customer name is required",
        field: "name",
      });
    }

    if (!req.body.email) {
      return res.status(400).json({
        error: "Customer email is required",
        field: "email",
      });
    }

    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);

    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Update customer
router.put("/customers/:id", authenticateToken, async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// Delete customer
router.delete("/customers/:id", authenticateToken, async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// PROPERTY ROUTES

// Get all properties
router.get("/properties", authenticateToken, async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Get single property by ID
router.get("/properties/:id", authenticateToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

// Create new property
router.post("/properties", authenticateToken, async (req, res) => {
  try {
    console.log("Received property data:", JSON.stringify(req.body, null, 2));

    // Prepare the property data with necessary transformations
    const propertyData = {
      ...req.body,
      // Handle the purpose field (default to Sale if needed)
      purpose: req.body.purpose || req.body.type || "Sale",

      // If type is "Sale" or "Rent", use it for purpose and set propertyType for type
      propertyType: req.body.propertyType || "Apartment",

      // Transform images array to photos array if needed
      media: {
        ...req.body.media,
        photos:
          req.body.media?.images?.map((img) =>
            typeof img === "string" ? img : img.url
          ) ||
          req.body.media?.photos ||
          [],
      },

      // Ensure owner is properly formatted
      owner: req.body.owner || {},

      // Handle numeric fields - convert string values to numbers
      price:
        typeof req.body.price === "string"
          ? parseFloat(req.body.price)
          : req.body.price,
    };

    if (propertyData.features) {
      // Convert numeric string values in features to actual numbers
      if (typeof propertyData.features.bedrooms === "string") {
        propertyData.features.bedrooms = parseInt(
          propertyData.features.bedrooms,
          10
        );
      }
      if (typeof propertyData.features.bathrooms === "string") {
        propertyData.features.bathrooms = parseInt(
          propertyData.features.bathrooms,
          10
        );
      }
      if (typeof propertyData.features.area === "string") {
        propertyData.features.area = parseFloat(propertyData.features.area);
      }
    }

    // Ensure required fields
    if (!propertyData.title) {
      return res.status(400).json({ error: "Property title is required" });
    }

    if (!propertyData.description) {
      return res
        .status(400)
        .json({ error: "Property description is required" });
    }

    if (!propertyData.price || isNaN(propertyData.price)) {
      return res
        .status(400)
        .json({ error: "Valid property price is required" });
    }

    if (!propertyData.location?.address) {
      return res.status(400).json({ error: "Property address is required" });
    }

    const newProperty = new Property(propertyData);
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error("Error creating property:", error);

    // Detailed error handling
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});

      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    res
      .status(500)
      .json({ error: "Failed to create property", details: error.message });
  }
});

// Update property
router.put("/properties/:id", authenticateToken, async (req, res) => {
  try {
    console.log("Updating property data:", JSON.stringify(req.body, null, 2));

    // Prepare the property data with proper media handling
    const propertyData = {
      ...req.body,
      // Transform images array to photos array if needed
      media: {
        ...req.body.media,
        photos:
          req.body.media?.images?.map((img) =>
            typeof img === "string" ? img : img.url
          ) ||
          req.body.media?.photos ||
          [],
      },
      updatedAt: new Date(),
    };

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      propertyData,
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);

    // Detailed error handling
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});

      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    res
      .status(500)
      .json({ error: "Failed to update property", details: error.message });
  }
});

// Delete property
router.delete("/properties/:id", authenticateToken, async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

// USER ROUTES

// Get all users (admin only)
router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user (admin only)
router.get("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user (admin only)
router.post("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, isAdmin } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "A user with this email already exists",
        field: "email",
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
        field: "name",
      });
    }

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        field: "email",
      });
    }

    if (!password) {
      return res.status(400).json({
        error: "Password is required",
        field: "password",
      });
    }

    // Hash the password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      isAdmin: isAdmin || false,
    });

    const savedUser = await newUser.save();

    // Return the user without password
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isAdmin: savedUser.isAdmin,
      createdAt: savedUser.createdAt,
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user (admin only)
router.put("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, isAdmin } = req.body;
    const updates = { name, email, role, isAdmin };

    // Don't update password if it's not provided
    if (password) {
      updates.password = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
    }

    // Check if updating to an email that already exists
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({
          error: "A user with this email already exists",
          field: "email",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Prevent deletion of the last admin user
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    const adminCount = await User.countDocuments({ isAdmin: true });
    const userToDelete = await User.findById(req.params.id);

    if (userToDelete?.isAdmin && adminCount <= 1) {
      return res.status(400).json({
        error: "Cannot delete the last admin user",
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// OPPORTUNITIES ROUTES

// Get all opportunities
router.get("/opportunities", authenticateToken, async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("customerId", "name email")
      .populate("propertyId", "title price location.address");
    res.json(opportunities);
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

// Get opportunities by customer ID
router.get(
  "/opportunities/customer/:customerId",
  authenticateToken,
  async (req, res) => {
    try {
      const opportunities = await Opportunity.find({
        customerId: req.params.customerId,
      })
        .populate("customerId", "name email")
        .populate("propertyId", "title price location.address");
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching customer opportunities:", error);
      res.status(500).json({ error: "Failed to fetch customer opportunities" });
    }
  }
);

// Get single opportunity by ID
router.get("/opportunities/:id", authenticateToken, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("propertyId", "title price location.address media");

    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json(opportunity);
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({ error: "Failed to fetch opportunity" });
  }
});

// Create new opportunity
router.post("/opportunities", authenticateToken, async (req, res) => {
  try {
    // Add the creating user's ID
    const opportunityData = {
      ...req.body,
      createdBy: req.user.id,
    };

    // Validate required fields
    if (!opportunityData.title) {
      return res.status(400).json({
        error: "Opportunity title is required",
        field: "title",
      });
    }

    if (!opportunityData.customerId) {
      return res.status(400).json({
        error: "Customer is required",
        field: "customerId",
      });
    }

    if (!opportunityData.budget || !opportunityData.budget.amount) {
      return res.status(400).json({
        error: "Budget amount is required",
        field: "budget.amount",
      });
    }

    const newOpportunity = new Opportunity(opportunityData);
    const savedOpportunity = await newOpportunity.save();

    // Return populated data
    const populatedOpportunity = await Opportunity.findById(
      savedOpportunity._id
    )
      .populate("customerId", "name email")
      .populate("propertyId", "title price location.address");

    res.status(201).json(populatedOpportunity);
  } catch (error) {
    console.error("Error creating opportunity:", error);

    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const errors = {};
      for (const field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({ error: "Failed to create opportunity" });
  }
});

// Update opportunity
router.put("/opportunities/:id", authenticateToken, async (req, res) => {
  try {
    // Update timestamps
    const opportunityData = {
      ...req.body,
      updatedAt: new Date(),
    };

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      opportunityData,
      { new: true, runValidators: true }
    )
      .populate("customerId", "name email")
      .populate("propertyId", "title price location.address");

    if (!updatedOpportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.json(updatedOpportunity);
  } catch (error) {
    console.error("Error updating opportunity:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});

      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    res.status(500).json({ error: "Failed to update opportunity" });
  }
});

// Delete opportunity
router.delete("/opportunities/:id", authenticateToken, async (req, res) => {
  try {
    const deletedOpportunity = await Opportunity.findByIdAndDelete(
      req.params.id
    );
    if (!deletedOpportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("Error deleting opportunity:", error);
    res.status(500).json({ error: "Failed to delete opportunity" });
  }
});

// Add an income scenario to an opportunity
router.post(
  "/opportunities/:id/scenarios",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const scenarioData = req.body;

      // Validate required fields for scenario
      if (!scenarioData.name) {
        return res.status(400).json({
          error: "Scenario name is required",
          field: "name",
        });
      }

      if (!scenarioData.income) {
        return res.status(400).json({
          error: "Income amount is required",
          field: "income",
        });
      }

      // Calculate ROI if income and expenses are provided
      if (scenarioData.income && scenarioData.expenses) {
        const netIncome = scenarioData.income - scenarioData.expenses;
        scenarioData.roi = (netIncome / scenarioData.income) * 100;
      }

      const opportunity = await Opportunity.findById(id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      opportunity.incomeScenarios.push(scenarioData);
      await opportunity.save();

      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Error adding scenario:", error);
      res.status(500).json({ error: "Failed to add scenario" });
    }
  }
);

// Remove an income scenario from an opportunity
router.delete(
  "/opportunities/:id/scenarios/:scenarioId",
  authenticateToken,
  async (req, res) => {
    try {
      const { id, scenarioId } = req.params;

      const opportunity = await Opportunity.findById(id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      opportunity.incomeScenarios = opportunity.incomeScenarios.filter(
        (scenario) => scenario._id.toString() !== scenarioId
      );

      await opportunity.save();
      res.json({ message: "Scenario removed successfully" });
    } catch (error) {
      console.error("Error removing scenario:", error);
      res.status(500).json({ error: "Failed to remove scenario" });
    }
  }
);

export default router;
