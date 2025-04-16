// Seed data for customers
export const customers = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    status: "Active",
    notes: "Looking for a 3-bedroom apartment in downtown",
    joinedDate: new Date("2024-01-15"),
    lastInteraction: new Date("2024-03-20"),
    preferences: {
      budget: {
        min: 200000,
        max: 450000,
      },
      location: ["Downtown", "Westside"],
      propertyType: ["Apartment", "Condo"],
      features: ["Parking", "Gym", "Pool"],
    },
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Park Ave, Los Angeles, CA 90001",
    status: "Active",
    notes: "Interested in commercial properties for investment",
    joinedDate: new Date("2024-02-10"),
    lastInteraction: new Date("2024-04-01"),
    preferences: {
      budget: {
        min: 500000,
        max: 1500000,
      },
      location: ["Business District", "Suburb"],
      propertyType: ["Commercial"],
      features: ["Parking", "Security System"],
    },
  },
  {
    name: "Robert Johnson",
    email: "robert.j@example.com",
    phone: "+1 (555) 555-5555",
    address: "789 Broadway, Chicago, IL 60007",
    status: "Lead",
    notes: "First time home buyer, interested in suburbs",
    joinedDate: new Date("2024-03-05"),
    lastInteraction: new Date("2024-03-15"),
    preferences: {
      budget: {
        min: 150000,
        max: 300000,
      },
      location: ["Suburb", "North Side"],
      propertyType: ["House", "Townhouse"],
      features: ["Garden", "Garage"],
    },
  },
  {
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "+1 (555) 777-8888",
    address: "101 Lake Dr, Miami, FL 33101",
    status: "Inactive",
    notes: "Looking for vacation properties",
    joinedDate: new Date("2023-11-20"),
    lastInteraction: new Date("2024-01-10"),
    preferences: {
      budget: {
        min: 350000,
        max: 700000,
      },
      location: ["Beachfront", "Resort Area"],
      propertyType: ["House", "Condo"],
      features: ["Pool", "Ocean View", "Security"],
    },
  },
];

export default customers;
