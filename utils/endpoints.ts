import { Profile, ProfileUpdateIn } from "@/constants/types";
import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const API_BASE_URL = "https://runalyst-backend-2xbs.onrender.com";
const TOKEN_STORAGE_KEY = "runalyst_auth_token";

type ApiErrorBody = Record<string, unknown> | null;

export type AuthTokenResponse = {
  access_token: string;
  token_type: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type Run = {
  id: number;
  title: string | null;
  video_path: string;
  analysis_results: Record<string, unknown> | null;
  created_at: string;
  user_id: number;
};

type RunsResponse =
  | Run[]
  | {
      runs?: Run[];
      data?: Run[];
      items?: Run[];
      results?: Run[];
    };

export type User = {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
};

export type UserUpdateIn = {
  email?: string;
  password?: string;
};

export type AnalysisResult = {
  id: number;
  run_id: number;
  [key: string]: unknown;
};

export type AppleLoginPayload = {
  identityToken: string;
  authorizationCode?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  appleUser?: string;
};

// Public API: auth
export async function register(email: string, password: string): Promise<RegisterResponse> {
  return requestPublic<RegisterResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, "Registration failed");
}

export async function login(email: string, password: string): Promise<AuthTokenResponse> {
  const data = await requestPublic<AuthTokenResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    "Login failed",
  );
  if (!data.access_token) throw new Error("No access_token received from server");
  await setStoredToken(data.access_token);
  return {
    access_token: data.access_token,
    token_type: data.token_type ?? "bearer",
  };
}

export async function loginWithApple(payload: AppleLoginPayload | string): Promise<AuthTokenResponse> {
  const normalized = typeof payload === "string" ? { identityToken: payload } : payload;
  const data = await requestPublic<AuthTokenResponse>(
    "/auth/apple",
    {
      method: "POST",
      body: JSON.stringify({
        identity_token: normalized.identityToken,
        authorization_code: normalized.authorizationCode,
        email: normalized.email,
        first_name: normalized.firstName,
        last_name: normalized.lastName,
        apple_user: normalized.appleUser,
      }),
    },
    "Apple sign-in failed",
  );
  if (!data.access_token) throw new Error("No access_token received from server");
  await setStoredToken(data.access_token);
  return {
    access_token: data.access_token,
    token_type: data.token_type ?? "bearer",
  };
}

// Public API: token/session
export async function getToken(): Promise<string | null> {
  return getStoredToken();
}

export async function logout(): Promise<void> {
  await deleteStoredToken();
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getToken());
}

// Public API: profiles
export async function getMyProfile(): Promise<Profile | null> {
  try {
    return await requestAuth<Profile>("/profiles/me", { method: "GET" }, "Failed to load profile");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const noProfileYet = /404\b/.test(message) || /profile not found/i.test(message) || /complete onboarding/i.test(message);
    if (noProfileYet) return null;
    throw error;
  }
}

export async function updateProfile(profileData: ProfileUpdateIn): Promise<Profile> {
  return requestAuth<Profile>(
    "/profiles/me",
    {
      method: "PATCH",
      body: JSON.stringify(profileData),
    },
    "Failed to update profile",
  );
}

// Public API: runs
export async function generateUploadUrl(): Promise<{ upload_url: string; path: string }> {
  return requestAuth<{ upload_url: string; path: string }>(
    "/runs/upload-url",
    { method: "POST" },
    "Failed to generate upload URL",
  );
}

export async function binaryUpload(
  fileUri: string,
  uploadUrl: string,
  contentType = "video/mp4",
): Promise<void> {
  if (Platform.OS === "web") {
    const videoBlob = await (await fetch(fileUri)).blob();
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: videoBlob,
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Upload failed (${response.status}): ${errorText}`);
    }
    return;
  }

  const base64Data = await FileSystem.readAsStringAsync(fileUri, {
    encoding: "base64" as never,
  });
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: byteArray,
    headers: { "Content-Type": contentType },
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Upload failed (${response.status}): ${errorText}`);
  }
}

export async function createRunRecord(video_path: string, title: string): Promise<Run> {
  return requestAuth<Run>(
    "/runs/create-record",
    {
      method: "POST",
      body: JSON.stringify({ video_path, title }),
    },
    "Failed to create run record",
  );
}

export async function getAllRuns(): Promise<Run[]> {
  const payload = await requestAuth<RunsResponse>("/runs/all", { method: "GET" }, "Failed to fetch runs");
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.runs)) return payload.runs;
    if (payload.runs && typeof payload.runs === "object") {
      const mappedRuns = Object.values(payload.runs as Record<string, unknown>).filter(
        (item): item is Run => !!item && typeof item === "object",
      );
      return mappedRuns;
    }
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
    const preview = JSON.stringify(payload).slice(0, 400);
    throw new Error(`Unexpected /runs/all response shape: ${preview}`);
  }
  throw new Error("Unexpected /runs/all response: empty or non-JSON payload");
}

export async function getRun(runId: number): Promise<Run> {
  return requestAuth<Run>(`/runs/get?run_id=${encodeURIComponent(String(runId))}`, { method: "GET" }, "Failed to fetch run");
}

// Public API: users
export async function getCurrentUser(): Promise<User> {
  return requestAuth<User>("/users/me", { method: "GET" }, "Failed to fetch current user");
}

export async function updateCurrentUser(payload: UserUpdateIn): Promise<User> {
  return requestAuth<User>(
    "/users/me",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    "Failed to update current user",
  );
}

export async function deleteCurrentUser(): Promise<void> {
  await requestAuth<void>("/users/me", { method: "DELETE" }, "Failed to delete account");
}

// Public API: analysis
export async function getAnalysis(runId: number): Promise<AnalysisResult> {
  return requestAuth<AnalysisResult>(
    `/analysis/get?run_id=${encodeURIComponent(String(runId))}`,
    { method: "GET" },
    "Failed to fetch analysis",
  );
}

export async function getAnalysisHistory(): Promise<AnalysisResult[]> {
  return requestAuth<AnalysisResult[]>("/analysis/history", { method: "GET" }, "Failed to fetch analysis history");
}

// Private helpers
function messageFromApiError(
  body: ApiErrorBody,
  status: number,
  statusText: string,
  fallback: string,
): string {
  const withStatus = `${fallback} (${status}${statusText ? ` ${statusText}` : ""})`;
  if (!body || typeof body !== "object") return withStatus;

  const detail = body.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const parts = detail.map((item) => {
      if (item && typeof item === "object" && typeof (item as { msg?: string }).msg === "string") {
        return (item as { msg: string }).msg;
      }
      try {
        return JSON.stringify(item);
      } catch {
        return String(item);
      }
    });
    const joined = parts.filter(Boolean).join(", ");
    if (joined) return joined;
  }
  if (typeof body.message === "string" && body.message.trim()) return body.message;
  return withStatus;
}

async function parseJsonSafe(response: Response): Promise<ApiErrorBody> {
  return response.json().catch(() => null);
}

async function requestPublic<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const responseBody = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(
      messageFromApiError(responseBody, response.status, response.statusText, fallbackMessage),
    );
  }
  return responseBody as T;
}

async function requestAuth<T>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  const token = await getStoredToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const responseBody = await parseJsonSafe(response);
  if (!response.ok) {
    if (response.status === 401) {
      await deleteStoredToken();
      throw new Error("Authentication token is invalid");
    }
    throw new Error(
      messageFromApiError(responseBody, response.status, response.statusText, fallbackMessage),
    );
  }
  return responseBody as T;
}

async function setStoredToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
}

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(TOKEN_STORAGE_KEY);
  return SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
}

async function deleteStoredToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}
