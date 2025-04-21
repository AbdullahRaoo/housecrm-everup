export interface DashboardStats {
  totalCustomers: number;
  activeDeals: number;
  totalRevenue: number;
  pendingTasks: number;
  propertyStats: {
    available: number;
    sold: number;
    rented: number;
  };
  monthlyComparison: {
    customers: number;
    deals: number;
    revenue: number;
    tasks: number;
  };
}

export interface TaskProgress {
  type: string;
  completed: number;
  total: number;
  color: string;
}

export interface PropertyPerformance {
  name: string;
  views: number;
  inquiries: number;
  sales: number;
}
