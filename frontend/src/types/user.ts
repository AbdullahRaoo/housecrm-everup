export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "user";
  isAdmin: boolean;
  lastLogin?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "agent" | "user";
  isAdmin: boolean;
}
