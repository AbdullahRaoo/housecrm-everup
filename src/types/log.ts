/* eslint-disable @typescript-eslint/no-explicit-any */
export type LogAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "IMPORT"
  | "STATUS_CHANGE";

export type LogEntityType =
  | "USER"
  | "CUSTOMER"
  | "PROPERTY"
  | "OPPORTUNITY"
  | "EVENT"
  | "SYSTEM";

export interface LogEntry {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  action: LogAction;
  entityType: LogEntityType;
  entityId?: string;
  description: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LogResponse {
  logs: LogEntry[];
  pagination: LogPagination;
}

export interface LogFilterOptions {
  page?: number;
  limit?: number;
  userId?: string;
  action?: LogAction;
  entityType?: LogEntityType;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface LogStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byAction: Record<LogAction, number>;
  byEntityType: Record<LogEntityType, number>;
}
