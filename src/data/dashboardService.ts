import { createStorageService, StorageKeys } from "../services/storage";
import { Property } from "../types/property";
import { Customer } from "../types/customer";
import { CalendarEvent } from "../types/calendar";
import { DashboardStats, TaskProgress, PropertyPerformance } from "./types";

export const getDashboardData = () => {
  const propertyStorage = createStorageService<Property>(
    StorageKeys.PROPERTIES
  );
  const eventStorage = createStorageService<CalendarEvent>(StorageKeys.EVENTS);
  const customerStorage = createStorageService<Customer>(StorageKeys.CUSTOMERS);

  const properties = propertyStorage.getAll();
  const customers = customerStorage.getAll();
  const events = eventStorage.getAll();

  // Calculate property stats
  const propertyStats = properties.reduce((acc, property) => {
    acc[property.status.toLowerCase()] =
      (acc[property.status.toLowerCase()] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate revenue
  const revenue = properties
    .filter((p) => p.status === "Sold")
    .reduce((sum, p) => sum + p.price, 0);

  const stats: DashboardStats = {
    totalCustomers: customers.length,
    activeDeals: properties.filter((p) => p.status === "Available").length,
    totalRevenue: revenue,
    pendingTasks: events.filter((e) => e.status === "Pending").length,
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

  // Get latest properties
  const latestProperties = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Get active clients
  const activeClients = customers
    .filter((client) => client.status === "Active")
    .sort(
      (a, b) =>
        new Date(b.lastInteraction ?? 0).getTime() -
        new Date(a.lastInteraction ?? 0).getTime()
    )
    .slice(0, 5);

  // Get upcoming tasks
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingTasks = events
    .filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  // Property performance data
  const propertyPerformance: PropertyPerformance[] = latestProperties.map(
    (property) => ({
      name: property.title.substring(0, 15) + "...",
      views: property.statistics.views,
      inquiries: property.statistics.inquiries,
      sales: property.type === "Sale" ? 1 : 0,
    })
  );

  return {
    stats,
    taskProgress,
    latestProperties,
    activeClients,
    upcomingTasks,
    propertyPerformance,
  };
};
