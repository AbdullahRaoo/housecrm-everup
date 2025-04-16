// Seed data for events
export const events = [
  {
    title: "Property Viewing - Downtown Apartment",
    type: "Visit",
    start: new Date(Date.now() + 86400000), // Tomorrow
    end: new Date(Date.now() + 86400000 + 3600000), // 1 hour after start
    description: "Meeting with client John Doe to view the downtown apartment",
    status: "Pending",
    deadline: new Date(Date.now() + 86400000),
    isGoogleCalendarSync: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Follow-up Call - Jane Smith",
    type: "Call",
    start: new Date(Date.now() + 2 * 86400000), // Day after tomorrow
    end: new Date(Date.now() + 2 * 86400000 + 1800000), // 30 mins after start
    description: "Call Jane to discuss property options",
    status: "Pending",
    deadline: new Date(Date.now() + 2 * 86400000),
    isGoogleCalendarSync: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Contract Signing - Beachfront Condo",
    type: "Visit",
    start: new Date(Date.now() + 3 * 86400000), // 3 days from now
    end: new Date(Date.now() + 3 * 86400000 + 7200000), // 2 hours after start
    description: "Meeting with Robert Johnson to sign property contract",
    status: "Pending",
    deadline: new Date(Date.now() + 3 * 86400000),
    isGoogleCalendarSync: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Property Photography Session",
    type: "Task",
    start: new Date(Date.now() + 1 * 86400000), // Tomorrow
    end: new Date(Date.now() + 1 * 86400000 + 10800000), // 3 hours after start
    description:
      "Professional photographer to take pictures of the Suburban Family Home",
    status: "Pending",
    deadline: new Date(Date.now() + 1 * 86400000),
    isGoogleCalendarSync: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Open House - Hillside View Lot",
    type: "Visit",
    start: new Date(Date.now() + 5 * 86400000), // 5 days from now
    end: new Date(Date.now() + 5 * 86400000 + 14400000), // 4 hours after start
    description: "Open house event for the Hillside property",
    status: "Pending",
    deadline: new Date(Date.now() + 5 * 86400000),
    isGoogleCalendarSync: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default events;
