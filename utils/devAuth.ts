/**
 * Temporary development authentication utility
 * Handles login, register, and token management for video upload
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// TODO: Replace with your actual backend API base URL
const API_BASE_URL = "https://runalyst-backend-2xbs.onrender.com";

// Token storage key
const TOKEN_STORAGE_KEY = "runalyst_auth_token";

export type Run = {
  id: number;
  title: string | null;
  video_path: string;
  analysis_results: Record<string, any> | null;
  created_at: string; // ISO datetime string
  user_id: number;
};

/**
 * Platform-specific token storage helpers
 */
async function storeTokenPlatform(token: string): Promise<void> {
  if (Platform.OS === "web") {
    // Use localStorage for web
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error("Error storing token in localStorage:", error);
      throw new Error("Failed to store authentication token");
    }
  } else {
    // Use SecureStore for native platforms
    try {
      await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error("Error storing token in SecureStore:", error);
      throw new Error("Failed to store authentication token");
    }
  }
}

async function getTokenPlatform(): Promise<string | null> {
  if (Platform.OS === "web") {
    // Use localStorage for web
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error getting token from localStorage:", error);
      return null;
    }
  } else {
    // Use SecureStore for native platforms
    try {
      return await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error getting token from SecureStore:", error);
      return null;
    }
  }
}

async function deleteTokenPlatform(): Promise<void> {
  if (Platform.OS === "web") {
    // Use localStorage for web
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing token from localStorage:", error);
    }
  } else {
    // Use SecureStore for native platforms
    try {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing token from SecureStore:", error);
    }
  }
}

/**
 * Register a new user
 * @param email - User email
 * @param password - User password
 * @returns Promise with user data (no token - user must login after signup)
 */
export async function register(
  email: string,
  password: string,
): Promise<{
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Registration failed";
      try {
        const errorData = await response.json();
        // Handle different error response formats
        if (errorData.detail) {
          // FastAPI style: { detail: "error message" } or { detail: [{ msg: "...", type: "..." }] }
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => err.msg || err.message || JSON.stringify(err))
              .join(", ");
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = `Registration failed: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Signup response: { id, email, is_active, created_at }
    // Note: No token in signup response - user must login after signup
    return data;
  } catch (error: any) {
    console.error("Registration error:", error);
    throw error;
  }
}

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @returns Promise with token or error
 */
export async function login(
  email: string,
  password: string,
): Promise<{ access_token: string; token_type: string }> {
  try {
    console.log("Attempting login with email:", email);
    console.log("API base URL:", API_BASE_URL);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        // Handle different error response formats
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => err.msg || err.message || JSON.stringify(err))
              .join(", ");
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch {
        errorMessage = `Login failed: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Login response: { access_token, token_type: "bearer" }
    if (!data.access_token) {
      throw new Error("No access_token received from server");
    }

    // Store token
    await storeToken(data.access_token);

    return {
      access_token: data.access_token,
      token_type: data.token_type || "bearer",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
}

/**
 * Get stored authentication token
 * @returns Promise with token or null if not found
 */
export async function getToken(): Promise<string | null> {
  return await getTokenPlatform();
}

/**
 * Store authentication token
 * @param token - Authentication token to store
 */
async function storeToken(token: string): Promise<void> {
  await storeTokenPlatform(token);
}

/**
 * Remove stored authentication token (logout)
 */
export async function logout(): Promise<void> {
  await deleteTokenPlatform();
}

/**
 * Check if user is authenticated
 * @returns Promise with boolean indicating if token exists
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return token !== null && token.length > 0;
}

/**
 * Get current user information
 * @returns Promise with user data
 */
export async function getCurrentUser(): Promise<{
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear it
        await logout();
        throw new Error("Authentication token is invalid");
      }
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get user" }));
      throw new Error(
        error.message || `Failed to get user: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Get current user error:", error);
    throw error;
  }
}

/**
 * Generate upload URL for video
 * @returns Promise with upload URL and path
 */
export async function generateUploadUrl(): Promise<{
  upload_url: string;
  path: string;
}> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/runs/upload-url`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await logout();
        throw new Error("Authentication token is invalid");
      }
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to generate upload URL" }));
      throw new Error(
        error.message ||
          `Failed to generate upload URL: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Generate upload URL error:", error);
    throw error;
  }
}

/**
 * Get all runs for the current user
 * @returns Promise with array of runs
 */
export async function getAllRuns(): Promise<Run[]> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/runs/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await logout();
        throw new Error("Authentication token is invalid");
      }
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to get runs" }));
      throw new Error(
        error.message || `Failed to get runs: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Convert the runs object to an array
    // Response format: { "runs": { "key1": run1, "key2": run2, ... } }
    const runsArray: Run[] = Object.values(data.runs || {});

    return runsArray;
  } catch (error: any) {
    console.error("Get all runs error:", error);
    throw error;
  }
}

export async function createRunRecord(
  video_path: string,
  title: string,
): Promise<Run> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Creating run record with:", { video_path, title });

    const response = await fetch(`${API_BASE_URL}/runs/create-record`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_path,
        title,
      }),
    });

    console.log("Create run response status:", response.status);
    console.log("Create run response statusText:", response.statusText);

    if (!response.ok) {
      if (response.status === 401) {
        await logout();
        throw new Error("Authentication token is invalid");
      }

      let errorMessage = `Failed to create run record: ${response.status}`;
      try {
        const errorData = await response.json();
        console.log("Error response data:", errorData);
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => err.msg || err.message || JSON.stringify(err))
              .join(", ");
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (parseError) {
        console.log("Could not parse error response:", parseError);
        try {
          const textResponse = await response.text();
          console.log("Raw error response:", textResponse);
          errorMessage += ` - ${textResponse}`;
        } catch (textError) {
          console.log("Could not get text response:", textError);
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Create run success:", data);
    return data;
  } catch (error: any) {
    console.error("Create run record failed:", error);
    throw error;
  }
}
// utils/devAuth.ts
type AppleLoginPayload = {
  identityToken: string;
  authorizationCode?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  appleUser?: string;
};

export async function loginWithApple(payload: AppleLoginPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity_token: payload.identityToken,
      authorization_code: payload.authorizationCode,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      apple_user: payload.appleUser,
    }),
  });

  let data: any = null;
  const text = await res.text();

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.detail || data?.message || text || "Apple sign-in failed.";
    throw new Error(message);
  }

  if (!data?.access_token) {
    throw new Error("No access_token received from server (Apple login).");
  }

  await storeToken(data.access_token);

  return {
    access_token: data.access_token,
    token_type: data.token_type || "bearer",
  };
}
