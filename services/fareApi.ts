export type PublicFareRow = {
  mode: string;
  distance_km: number;
  regular: number;
  discounted: number;
};

export type PrivateFareSettings = {
  base_fare: number;
  per_km_rate: number;
  fuel_price: number;
};

export type PrivateVehicleFuelSetting = {
  vehicle_type: string;
  fuel_efficiency: number;
  fuel_price: number;
};

export type PrivateFuelPriceOption = {
  fuel_type: string;
  price: number;
  is_default: boolean;
};

export type FareRuleRow = {
  transport_mode: string;
  service_type: string;
  origin: string;
  destination: string;
  fare: number;
  variant_type: string;
};

export type PublicFareFormula = {
  mode: string;
  base_fare: number;
  increment_per_km: number;
  discount_percent: number;
  max_distance_km: number;
  included_distance_km?: number;
  additional_rate_per_succeeding_km?: number;
};

export type FareRatesResponse = {
  public: PublicFareRow[];
  fare_rules: FareRuleRow[];
  private_settings?: PrivateFareSettings | null;
};

export type AdminLoginResponse = {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  username: string;
};

export type AdminSessionResponse = {
  authenticated: boolean;
  username?: string | null;
  expires_at_unix?: number | null;
};

const BACKEND_TARGET = String(process.env.EXPO_PUBLIC_BACKEND_TARGET || "local")
  .trim()
  .toLowerCase();

const LOCAL_API_URL = String(
  process.env.EXPO_PUBLIC_ADMIN_API_URL_LOCAL ||
    process.env.EXPO_PUBLIC_ADMIN_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000",
)
  .trim()
  .replace(/\/+$/, "");

const DEPLOYED_API_URL = String(
  process.env.EXPO_PUBLIC_ADMIN_API_URL_DEPLOYED || "",
)
  .trim()
  .replace(/\/+$/, "");

const API_BASE_URL =
  BACKEND_TARGET === "deployed" && DEPLOYED_API_URL.length > 0
    ? DEPLOYED_API_URL
    : LOCAL_API_URL;

const API_KEY = String(process.env.EXPO_PUBLIC_ADMIN_API_KEY || "").trim();
const API_KEY_HEADER = String(
  process.env.EXPO_PUBLIC_ADMIN_API_KEY_HEADER || "X-Admin-API-Key",
).trim();

const ADMIN_SESSION_STORAGE_KEY = "admin_session_token";

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getAdminSessionToken(): string {
  if (!hasBrowserStorage()) return "";
  return String(
    window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || "",
  ).trim();
}

export function setAdminSessionToken(token: string): void {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(
    ADMIN_SESSION_STORAGE_KEY,
    String(token || "").trim(),
  );
}

export function clearAdminSessionToken(): void {
  if (!hasBrowserStorage()) return;
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
}

export function isAdminAuthenticatedClient(): boolean {
  // Keep API key fallback for compatibility if login auth is not yet configured.
  return getAdminSessionToken().length > 0 || API_KEY.length > 0;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { skipAuth?: boolean },
): Promise<T> {
  if (BACKEND_TARGET === "deployed" && DEPLOYED_API_URL.length === 0) {
    throw new Error(
      "EXPO_PUBLIC_BACKEND_TARGET is 'deployed' but EXPO_PUBLIC_ADMIN_API_URL_DEPLOYED is not set.",
    );
  }

  const headers = new Headers(init?.headers || undefined);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options?.skipAuth) {
    const token = getAdminSessionToken();
    if (token.length > 0) {
      headers.set("Authorization", `Bearer ${token}`);
    } else if (API_KEY.length > 0) {
      headers.set(API_KEY_HEADER, API_KEY);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && !options?.skipAuth) {
      clearAdminSessionToken();
    }
    const detail =
      typeof data === "object" && data && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : String(data || `Request failed (${response.status})`);
    throw new Error(detail);
  }

  return data as T;
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminLoginResponse> {
  const data = await request<AdminLoginResponse>(
    "/admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    { skipAuth: true },
  );

  setAdminSessionToken(String(data.access_token || "").trim());
  return data;
}

export async function getAdminSession(): Promise<AdminSessionResponse> {
  return request<AdminSessionResponse>("/admin/auth/session", undefined, {
    skipAuth: false,
  });
}

export async function getFareRates(): Promise<FareRatesResponse> {
  return request<FareRatesResponse>("/admin/fare-rates");
}

export async function updatePublicFareRates(
  rows: PublicFareRow[],
): Promise<PublicFareRow[]> {
  return request<PublicFareRow[]>("/admin/fare-rates/public", {
    method: "PUT",
    body: JSON.stringify({ rows }),
  });
}

export async function updatePublicFareTables(payload: {
  public_mode_fares: PublicFareRow[];
  fare_rules: FareRuleRow[];
}): Promise<FareRatesResponse> {
  return request<FareRatesResponse>("/admin/fare-rates/public-all", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updatePrivateFareSettings(
  settings: PrivateFareSettings,
): Promise<PrivateFareSettings> {
  return request<PrivateFareSettings>("/admin/fare-rates/private", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

export async function getPrivateVehicleFuelSettings(): Promise<
  PrivateVehicleFuelSetting[]
> {
  return request<PrivateVehicleFuelSetting[]>(
    "/admin/fare-rates/private-vehicles",
  );
}

export async function updatePrivateVehicleFuelSettings(
  rows: PrivateVehicleFuelSetting[],
): Promise<PrivateVehicleFuelSetting[]> {
  return request<PrivateVehicleFuelSetting[]>(
    "/admin/fare-rates/private-vehicles",
    {
      method: "PUT",
      body: JSON.stringify({ rows }),
    },
  );
}

export async function getPrivateFuelPriceOptions(): Promise<
  PrivateFuelPriceOption[]
> {
  return request<PrivateFuelPriceOption[]>(
    "/admin/fare-rates/private-fuel-prices",
  );
}

export async function updatePrivateFuelPriceOptions(
  rows: PrivateFuelPriceOption[],
): Promise<PrivateFuelPriceOption[]> {
  return request<PrivateFuelPriceOption[]>(
    "/admin/fare-rates/private-fuel-prices",
    {
      method: "PUT",
      body: JSON.stringify({ rows }),
    },
  );
}

export async function generatePublicFareRows(
  formulas: PublicFareFormula[],
): Promise<PublicFareRow[]> {
  return request<PublicFareRow[]>("/admin/fare-rates/public-generate", {
    method: "POST",
    body: JSON.stringify({ formulas }),
  });
}
