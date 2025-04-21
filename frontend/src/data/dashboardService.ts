import { createStorageService, StorageKeys } from "../services/storage";
import { CalendarEvent } from "../types/calendar";
import { Customer } from "../types/customer";
import { Property } from "../types/property";
import { DashboardStats, PropertyPerformance, TaskProgress } from "./types";

export const getDashboardData = async () => {
  const propertyStorage = createStorageService<Property>(
    StorageKeys.PROPERTIES
  );
  const eventStorage = createStorageService<CalendarEvent>(StorageKeys.EVENTS);
  const customerStorage = createStorageService<Customer>(StorageKeys.CUSTOMERS);

  let properties: Property[] = [];
  let customers: Customer[] = [];
  let events: CalendarEvent[] = [];

  try {
    // Fetch data with better type handling
    try {
      const propertiesResponse = await propertyStorage.getAll();
      properties = Array.isArray(propertiesResponse) ? propertiesResponse : [];
    } catch (err) {
      console.error("Error fetching properties:", err);
    }

    try {
      const customersResponse = await customerStorage.getAll();
      customers = Array.isArray(customersResponse) ? customersResponse : [];
    } catch (err) {
      console.error("Error fetching customers:", err);
    }

    try {
      const eventsResponse = await eventStorage.getAll();
      console.log("Events from API:", eventsResponse);
      events = Array.isArray(eventsResponse) ? eventsResponse : [];
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  } catch (error) {
    console.error("General error fetching data:", error);
  }

  console.log("Events after processing:", events);
  console.log("Is events array?", Array.isArray(events));

  // Extra safeguard for all arrays
  if (!Array.isArray(properties)) properties = [];
  if (!Array.isArray(customers)) customers = [];
  if (!Array.isArray(events)) events = [];

  // Calculate property stats (with extra safeguards)
  const propertyStats = properties.reduce((acc, property) => {
    if (property && typeof property === "object") {
      const status = property.status?.toLowerCase() || "unknown";
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate revenue (with extra safeguards)
  const revenue = properties
    .filter((p) => p && p.status === "Sold")
    .reduce((sum, p) => sum + (p.price || 0), 0);

  // Calculate pendingTasks with a defensive approach
  let pendingTasks = 0;
  if (Array.isArray(events)) {
    pendingTasks = events.filter((e) => e && e.status === "Pending").length;
  }

  const stats: DashboardStats = {
    totalCustomers: Array.isArray(customers) ? customers.length : 0,
    activeDeals: Array.isArray(properties)
      ? properties.filter((p) => p && p.status === "Available").length
      : 0,
    totalRevenue: revenue,
    pendingTasks,
    propertyStats: {
      available: propertyStats.available || 0,
      sold: propertyStats.sold || 0,
      rented: propertyStats.rented || 0,
    },
    monthlyComparison: {
      customers: 12,
      deals: 0,
      revenue: 8,
      tasks: -5,
    },
  };

  // Task progress data
  const taskProgress: TaskProgress[] = [
    {
      type: "Property Viewings",
      completed: 8,
      total: 12,
      color: "#e56e43",
    },
    {
      type: "Client Meetings",
      completed: 15,
      total: 20,
      color: "#3b82f6",
    },
    {
      type: "Document Reviews",
      completed: 12,
      total: 15,
      color: "#10b981",
    },
  ];

  // Get latest properties (with extra safeguards)
  const latestProperties = Array.isArray(properties)
    ? [...properties]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 5)
    : [];

  // Get active clients (with extra safeguards)
  const activeClients = Array.isArray(customers)
    ? customers
        .filter((client) => client && client.status === "Active")
        .sort(
          (a, b) =>
            new Date(b.lastInteraction ?? 0).getTime() -
            new Date(a.lastInteraction ?? 0).getTime()
        )
        .slice(0, 5)
    : [];

  // Get upcoming tasks (with extra safeguards)
  let upcomingTasks: CalendarEvent[] = [];
  if (Array.isArray(events)) {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    upcomingTasks = events
      .filter((event) => {
        if (!event || !event.start) return false;
        const eventDate = new Date(event.start);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  }

  // Property performance data (with extra safeguards)
  const propertyPerformance: PropertyPerformance[] = Array.isArray(
    latestProperties
  )
    ? latestProperties.map((property) => ({
        name: property.title?.substring(0, 15) + "..." || "Untitled",
        views: property.statistics?.views || 0,
        inquiries: property.statistics?.inquiries || 0,
        sales: property.type === "Sale" ? 1 : 0,
      }))
    : [];

  return {
    stats,
    taskProgress,
    latestProperties,
    activeClients,
    upcomingTasks,
    propertyPerformance,
  };
};
