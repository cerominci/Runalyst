/**
 * Temporary development authentication utility
 * Handles login, register, and token management for video upload
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// TODO: Replace with your actual backend API base URL
const API_BASE_URL = 'https://runalyst-backend.onrender.com';

// Token storage key
const TOKEN_STORAGE_KEY = 'runalyst_auth_token';

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
  if (Platform.OS === 'web') {
    // Use localStorage for web
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error storing token in localStorage:', error);
      throw new Error('Failed to store authentication token');
    }
  } else {
    // Use SecureStore for native platforms
    try {
      await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Error storing token in SecureStore:', error);
      throw new Error('Failed to store authentication token');
    }
  }
}

async function getTokenPlatform(): Promise<string | null> {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  } else {
    // Use SecureStore for native platforms
    try {
      return await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error getting token from SecureStore:', error);
      return null;
    }
  }
}

async function deleteTokenPlatform(): Promise<void> {
  if (Platform.OS === 'web') {
    // Use localStorage for web
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  } else {
    // Use SecureStore for native platforms
    try {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing token from SecureStore:', error);
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
  password: string
): Promise<{ id: number; email: string; is_active: boolean; created_at: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        // Handle different error response formats
        if (errorData.detail) {
          // FastAPI style: { detail: "error message" } or { detail: [{ msg: "...", type: "..." }] }
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
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
    console.error('Registration error:', error);
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
  password: string
): Promise<{ access_token: string; token_type: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        // Handle different error response formats
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (parseError) {
        errorMessage = `Login failed: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Login response: { access_token, token_type: "bearer" }
    if (!data.access_token) {
      throw new Error('No access_token received from server');
    }

    // Store token
    await storeToken(data.access_token);
    
    return { access_token: data.access_token, token_type: data.token_type || 'bearer' };
  } catch (error: any) {
    console.error('Login error:', error);
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
export async function getCurrentUser(): Promise<{ id: number; email: string; is_active: boolean; created_at: string }> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear it
        await logout();
        throw new Error('Authentication token is invalid');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to get user' }));
      throw new Error(error.message || `Failed to get user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Get current user error:', error);
    throw error;
  }
}

/**
 * Generate upload URL for video
 * @returns Promise with upload URL and path
 */
export async function generateUploadUrl(): Promise<{ upload_url: string; path: string }> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await logout();
        throw new Error('Authentication token is invalid');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to generate upload URL' }));
      throw new Error(error.message || `Failed to generate upload URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Generate upload URL error:', error);
    throw error;
  }
}

export async function createRunRecord(video_path: string, title: string): Promise<Run | void> {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await fetch(`${API_BASE_URL}/runs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_path,
                title,
            })
        })
        if (!response.ok) {
            if (response.status === 401) {
                await logout();
                throw new Error('Authentication token is invalid');
            }
            const error = await response.json().catch(() => ({message: 'Failed to create run record' }));
            throw new Error(error.message || `Failed to create run record: ${response.statusText}`);
        }
    } catch (error: any){
        console.error('Create run record failed:', error);
        throw error;
    }
}

export async function loginWithApple(identityToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity_token: identityToken }),
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();

  // Expect the backend to return the same shape as /auth/login
  if (!data.access_token) {
    throw new Error("No access_token received from server (Apple login).");
  }

  await storeToken(data.access_token); // <- same as login()
  return { access_token: data.access_token, token_type: data.token_type || "bearer" };
}

export async function loginWithGoogle(idToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: idToken }),
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();

  if (!data.access_token) {
    throw new Error("No access_token received from server (Google login).");
  }

  await storeToken(data.access_token); // <- same as login()
  return { access_token: data.access_token, token_type: data.token_type || "bearer" };
}
