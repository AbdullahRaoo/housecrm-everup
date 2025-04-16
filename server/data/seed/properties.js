// Seed data for properties
export const properties = [
  {
    title: "Luxury Downtown Apartment",
    description:
      "Beautiful modern apartment in the heart of downtown with amazing city views and premium finishes.",
    type: "Apartment",
    purpose: "Sale",
    price: 450000,
    location: {
      address: "123 Downtown Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      yearBuilt: 2018,
      hasParking: true,
      hasGarden: false,
      hasPool: true,
      isFurnished: false,
      otherAmenities: ["Gym", "Concierge", "Roof Terrace"],
    },
    media: {
      photos: [
        "https://res.cloudinary.com/demo/image/upload/v1580125016/samples/ecommerce/accessories-bag.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1580125021/samples/animals/cat.jpg",
      ],
      videos: [],
      virtualTour: "https://example.com/virtual-tour/apt123",
    },
    status: "Available",
  },
  {
    title: "Suburban Family Home",
    description:
      "Spacious family home in a quiet, family-friendly neighborhood with a large backyard and modern appliances.",
    type: "House",
    purpose: "Sale",
    price: 650000,
    location: {
      address: "456 Family Lane",
      city: "Chicago",
      state: "IL",
      zipCode: "60007",
      country: "USA",
      coordinates: {
        lat: 41.8781,
        lng: -87.6298,
      },
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 2400,
      yearBuilt: 2010,
      hasParking: true,
      hasGarden: true,
      hasPool: false,
      isFurnished: false,
      otherAmenities: ["Finished Basement", "Double Garage", "Fireplace"],
    },
    media: {
      photos: [
        "https://res.cloudinary.com/demo/image/upload/v1580125017/samples/food/pot-mussels.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1580125007/samples/food/fish-vegetables.jpg",
      ],
      videos: ["https://example.com/video/home456"],
      virtualTour: "",
    },
    status: "Available",
  },
  {
    title: "Beachfront Condo",
    description:
      "Beautiful beachfront condo with stunning ocean views. Perfect for vacation or permanent residence.",
    type: "Apartment",
    purpose: "Rent",
    price: 3500,
    location: {
      address: "789 Ocean Drive",
      city: "Miami",
      state: "FL",
      zipCode: "33139",
      country: "USA",
      coordinates: {
        lat: 25.7617,
        lng: -80.1918,
      },
    },
    features: {
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      yearBuilt: 2015,
      hasParking: true,
      hasGarden: false,
      hasPool: true,
      isFurnished: true,
      otherAmenities: [
        "Beach Access",
        "Balcony",
        "Security System",
        "Fitness Center",
      ],
    },
    media: {
      photos: [
        "https://res.cloudinary.com/demo/image/upload/v1580125016/samples/landscapes/beach-boat.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1580125012/samples/landscapes/nature-mountains.jpg",
      ],
      videos: [],
      virtualTour: "https://example.com/virtual-tour/condo789",
    },
    status: "Available",
  },
  {
    title: "Downtown Office Space",
    description:
      "Modern office space in the heart of the business district. Ideal for small to medium businesses.",
    type: "Commercial",
    purpose: "Rent",
    price: 4500,
    location: {
      address: "101 Business Plaza",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
      coordinates: {
        lat: 34.0522,
        lng: -118.2437,
      },
    },
    features: {
      bedrooms: 0,
      bathrooms: 2,
      area: 2500,
      yearBuilt: 2012,
      hasParking: true,
      hasGarden: false,
      hasPool: false,
      isFurnished: false,
      otherAmenities: [
        "Conference Room",
        "Kitchen",
        "Reception Area",
        "High-Speed Internet",
      ],
    },
    media: {
      photos: [
        "https://res.cloudinary.com/demo/image/upload/v1580125013/samples/cloudinary-group.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1580125013/samples/landscapes/landscape-panorama.jpg",
      ],
      videos: [],
      virtualTour: "",
    },
    status: "Available",
  },
  {
    title: "Hillside View Lot",
    description:
      "Beautiful hillside lot with panoramic city views. Perfect for building your dream home.",
    type: "Land",
    purpose: "Sale",
    price: 350000,
    location: {
      address: "555 Hillside Road",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "USA",
      coordinates: {
        lat: 30.2672,
        lng: -97.7431,
      },
    },
    features: {
      bedrooms: 0,
      bathrooms: 0,
      area: 10000,
      yearBuilt: 0,
      hasParking: false,
      hasGarden: false,
      hasPool: false,
      isFurnished: false,
      otherAmenities: ["Utilities Available", "Road Access"],
    },
    media: {
      photos: [
        "https://res.cloudinary.com/demo/image/upload/v1580125010/samples/landscapes/girl-urban-view.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1580125009/samples/landscapes/architecture-signs.jpg",
      ],
      videos: [],
      virtualTour: "",
    },
    status: "Available",
  },
];

export default properties;
