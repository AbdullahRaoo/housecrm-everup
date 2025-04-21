import axios from "axios";
import { LogFilterOptions, LogResponse, LogStats } from "../types/log";

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Service to handle log-related API calls
 */
const logService = {
  /**
   * Get logs with filtering and pagination
   */
  async getLogs(options: LogFilterOptions = {}): Promise<LogResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Add all provided options as query parameters
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_URL}/logs?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw error;
    }
  },

  /**
   * Get log statistics
   */
  async getLogStats(): Promise<LogStats> {
    try {
      const response = await axios.get(`${API_URL}/logs/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching log statistics:", error);
      throw error;
    }
  },

  /**
   * Clear old logs
   */
  async clearOldLogs(days: number = 90): Promise<{ deletedCount: number }> {
    try {
      const response = await axios.delete(
        `${API_URL}/logs/cleanup?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Error clearing old logs:", error);
      throw error;
    }
  },

  /**
   * Get export URL for logs based on format
   */
  getExportUrl(
    options: LogFilterOptions = {},
    format: "csv" | "excel" = "csv"
  ): string {
    const queryParams = new URLSearchParams();

    // Add all provided options as query parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    return `${API_URL}/logs/export/${format}?${queryParams.toString()}`;
  },

  /**
   * Export logs as a blob (for direct download)
   */
  async exportLogs(
    options: LogFilterOptions = {},
    format: "csv" | "excel" = "csv"
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();

      // Add all provided options as query parameters
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${API_URL}/logs/export/${format}?${queryParams.toString()}`,
        { responseType: "blob" }
      );

      return response.data;
    } catch (error) {
      console.error(`Error exporting logs as ${format}:`, error);
      throw error;
    }
  },
};

export default logService;
