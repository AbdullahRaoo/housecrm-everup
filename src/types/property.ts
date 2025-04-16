export interface Property {
  id: string;
  _id?: string; // Adding support for MongoDB's _id format
  title: string;
  propertyType:
    | "Apartment"
    | "House"
    | "Villa"
    | "Office"
    | "Commercial"
    | "Land"
    | "Industrial";
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
    images: string[] | CloudinaryImage[];
    photos?: string[]; // Adding support for the photos field used in the API response
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

// Define the CloudinaryImage interface at the type level for reuse
export interface CloudinaryImage {
  url: string;
  public_id: string;
}
