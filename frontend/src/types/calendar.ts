export type EventType = "Visit" | "Call" | "Email" | "Task";
export type ViewType = "Day" | "Week" | "Month";

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  start: string;
  end: string;
  description?: string;
  propertyId?: string;
  customerId?: string;
  status: "Pending" | "Completed" | "Cancelled";
  deadline?: string;
  isGoogleCalendarSync?: boolean;
}
