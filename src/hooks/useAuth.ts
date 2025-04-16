/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from "react";
import { AuthContext, User } from "../context/AuthContext";

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: any) => void;
  logout: () => void;
  token: string | null;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
