export interface Property {
  id: string;
  title: string;
  propertyType: "Apartment" | "House" | "Villa" | "Office" | "Commercial" | "Land" | "Industrial";
  type: "Sale" | "Rent";
  price: number;
  status: "Available" | "Sold" | "Reserved";
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    area: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number;
    amenities: string[];
  };
  media: {
    images: string[];
    videos: string[];
    virtualTour?: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    createdAt: string;
  }[];
  description: string;
  statistics: {
    views: number;
    inquiries: number;
    visits: number;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  visits: {
    id: string;
    date: string;
    clientId: string;
    clientName: string;
    status: "Scheduled" | "Completed" | "Cancelled";
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
