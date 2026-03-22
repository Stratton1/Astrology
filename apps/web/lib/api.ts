/**
 * COSMOS API Client
 *
 * All requests go through the `apiFetch` helper which:
 *  - Prefixes paths with the base URL (NEXT_PUBLIC_API_URL or localhost fallback)
 *  - Attaches an Authorization header when a token is provided
 *  - Throws a typed ApiClientError on non-2xx responses
 *
 * Functions are fully typed using @cosmos/types.
 */

import type {
  User,
  Profile,
  ChartCalculation,
  Synthesis,
  LoginRequest,
  RegisterRequest,
  CalculateChartRequest,
  CreateProfileRequest,
  UpdateProfileRequest,
  GenerateSynthesisRequest,
  ApiError,
  ApiResponse,
  PaginatedResponse,
} from '@cosmos/types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
const API_PREFIX = '/api/v1';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId: string;

  constructor(status: number, payload: ApiError) {
    super(payload.error.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = payload.error.code;
    this.requestId = payload.error.requestId;
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Bearer token for authenticated requests */
  token?: string | null;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Next.js fetch cache / revalidation options */
  next?: NextFetchRequestConfig;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers: extraHeaders = {}, next } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${API_PREFIX}${path}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...(next ? { next } : {}),
  });

  // 204 No Content — return undefined cast to T
  if (res.status === 204) {
    return undefined as T;
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Non-JSON response from ${method} ${path}: ${res.status}`);
  }

  if (!res.ok) {
    throw new ApiClientError(res.status, json as ApiError);
  }

  return json as T;
}

// ---------------------------------------------------------------------------
// Auth token response shape
// ---------------------------------------------------------------------------

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(
  payload: LoginRequest,
): Promise<ApiResponse<TokenResponse>> {
  return apiFetch<ApiResponse<TokenResponse>>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function register(
  payload: RegisterRequest,
): Promise<ApiResponse<TokenResponse>> {
  return apiFetch<ApiResponse<TokenResponse>>('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
  return apiFetch('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export async function logout(token: string): Promise<void> {
  return apiFetch('/auth/logout', { method: 'POST', token });
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------

export async function getProfiles(
  token: string,
): Promise<PaginatedResponse<Profile>> {
  return apiFetch<PaginatedResponse<Profile>>('/profiles', { token });
}

export async function getProfile(
  id: string,
  token: string,
): Promise<ApiResponse<Profile>> {
  return apiFetch<ApiResponse<Profile>>(`/profiles/${id}`, { token });
}

export async function createProfile(
  payload: CreateProfileRequest,
  token: string,
): Promise<ApiResponse<Profile>> {
  return apiFetch<ApiResponse<Profile>>('/profiles', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function updateProfile(
  id: string,
  payload: UpdateProfileRequest,
  token: string,
): Promise<ApiResponse<Profile>> {
  return apiFetch<ApiResponse<Profile>>(`/profiles/${id}`, {
    method: 'PATCH',
    body: payload,
    token,
  });
}

export async function deleteProfile(
  id: string,
  token: string,
): Promise<void> {
  return apiFetch(`/profiles/${id}`, { method: 'DELETE', token });
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

export async function calculateChart(
  payload: CalculateChartRequest,
  token?: string | null,
): Promise<ApiResponse<ChartCalculation>> {
  return apiFetch<ApiResponse<ChartCalculation>>('/charts/calculate', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function getChart(
  id: string,
  token?: string | null,
  opts?: { revalidate?: number },
): Promise<ApiResponse<ChartCalculation>> {
  return apiFetch<ApiResponse<ChartCalculation>>(`/charts/${id}`, {
    token,
    next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
  });
}

export async function listCharts(
  token: string,
  cursor?: string,
): Promise<PaginatedResponse<ChartCalculation>> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiFetch<PaginatedResponse<ChartCalculation>>(`/charts${qs}`, { token });
}

// ---------------------------------------------------------------------------
// Synthesis
// ---------------------------------------------------------------------------

export async function generateSynthesis(
  payload: GenerateSynthesisRequest,
  token: string,
): Promise<ApiResponse<Synthesis>> {
  return apiFetch<ApiResponse<Synthesis>>('/synthesis', {
    method: 'POST',
    body: payload,
    token,
  });
}

export async function getSynthesis(
  id: string,
  token: string,
  opts?: { revalidate?: number },
): Promise<ApiResponse<Synthesis>> {
  return apiFetch<ApiResponse<Synthesis>>(`/synthesis/${id}`, {
    token,
    next: opts?.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
  });
}

export async function listSynthesesForChart(
  chartId: string,
  token: string,
): Promise<PaginatedResponse<Synthesis>> {
  return apiFetch<PaginatedResponse<Synthesis>>(
    `/synthesis?chartId=${encodeURIComponent(chartId)}`,
    { token },
  );
}
