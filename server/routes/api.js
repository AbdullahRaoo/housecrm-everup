import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import xlsx from "xlsx";
import Customer from "../models/Customer.js";
import Event from "../models/Event.js";
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
    const newEvent = new Event(req.body);
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
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
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
    const newProperty = new Property(req.body);
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ error: "Failed to create property" });
  }
});

// Update property
router.put("/properties/:id", authenticateToken, async (req, res) => {
  try {
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ error: "Failed to update property" });
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

export default router;
