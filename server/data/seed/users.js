import crypto from "crypto";

// Hash password function
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Seed data for users
export const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: hashPassword("admin123"),
    role: "admin",
    isAdmin: true,
    profileImage:
      "https://res.cloudinary.com/demo/image/upload/v1580125009/samples/people/smiling-man.jpg",
    lastLogin: new Date(),
  },
  {
    name: "Agent Smith",
    email: "agent@example.com",
    password: hashPassword("agent123"),
    role: "agent",
    isAdmin: false,
    profileImage:
      "https://res.cloudinary.com/demo/image/upload/v1580125003/samples/people/boy-snow-hoodie.jpg",
    lastLogin: new Date(),
  },
  {
    name: "Regular User",
    email: "user@example.com",
    password: hashPassword("user123"),
    role: "user",
    isAdmin: false,
    profileImage:
      "https://res.cloudinary.com/demo/image/upload/v1580125007/samples/people/kitchen-bar.jpg",
    lastLogin: new Date(),
  },
];

export default users;
