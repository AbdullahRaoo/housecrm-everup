export interface IncomeScenario {
  _id?: string;
  name: string;
  description?: string;
  income: number;
  expenses: number;
  roi?: number;
  probability: number;
  notes?: string;
}

export interface Opportunity {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  customerId: string;
  propertyId?: string;
  budget: {
    amount: number;
    currency: string;
  };
  status: "Draft" | "Proposed" | "Accepted" | "Rejected" | "Expired";
  incomeScenarios: IncomeScenario[];
  validUntil?: string | Date;
  createdBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Populated fields from relations
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  property?: {
    title: string;
    price: number;
    location: {
      address: string;
    };
    media?: any;
  };
}
