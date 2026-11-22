import { getBearerAuthHeaders } from "./api-access-token.ts";

export const SERVICE_CATEGORIES = [
  "Photography",
  "Videography",
  "Wedding Venue",
  "Catering",
  "Decoration",
  "Makeup & Beauty",
  "Music & Entertainment",
  "Wedding Planning",
  "Wedding Fashion",
  "Other",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export type PublicServiceSort =
  | "recommended"
  | "newest"
  | "price_asc"
  | "price_desc";

export interface PublicService {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  location: string;
  price: number;
  images: string[];
  createdAt: string;
  vendor?: ServiceVendor | null;
}

export interface ServiceVendor {
  id: string;
  name?: string;
  profileImage?: string;
  businessName?: string;
}

export interface ServiceDetail extends PublicService {
  vendor?: ServiceVendor | null;
}

export interface ServicesMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ServicesResponse {
  success: true;
  data: PublicService[];
  meta: ServicesMeta;
}

export interface ServiceResponse {
  success: true;
  data: ServiceDetail;
}

export interface ServiceBrowseParams {
  q: string;
  category: string;
  location: string;
  sort: PublicServiceSort;
  page: number;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function buildServicesQuery(params: ServiceBrowseParams): string {
  const query = new URLSearchParams();

  if (params.q.trim()) query.set("q", params.q.trim());
  if (params.category) query.set("category", params.category);
  if (params.location.trim()) query.set("location", params.location.trim());
  query.set("sort", params.sort);
  query.set("page", String(params.page));

  return query.toString();
}

async function parseResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiError("The server returned an invalid response.", response.status);
  }
}

export async function getPublicServices(
  query: string,
  signal?: AbortSignal
): Promise<ServicesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/services?${query}`, {
    signal,
    cache: "no-store",
  });
  const body = (await parseResponse(response)) as Partial<ServicesResponse> & {
    success?: boolean;
    error?: { message?: string };
  };

  if (!response.ok || body.success !== true) {
    throw new ApiError(
      body.error?.message || "Unable to load services right now.",
      response.status
    );
  }

  if (!Array.isArray(body.data) || !body.meta) {
    throw new ApiError("The server returned an unexpected response.", response.status);
  }

  return body as ServicesResponse;
}

export async function getPublicService(
  id: string,
  signal?: AbortSignal
): Promise<ServiceDetail> {
  const headers = await getBearerAuthHeaders({
    Accept: "application/json",
  });
  const response = await fetch(
    `${API_BASE_URL}/api/services/${encodeURIComponent(id)}`,
    { signal, cache: "no-store", credentials: "include", headers }
  );
  const body = (await parseResponse(response)) as Partial<ServiceResponse> & {
    success?: boolean;
    error?: { message?: string };
  };

  if (!response.ok || body.success !== true) {
    throw new ApiError(
      body.error?.message || "Unable to load this service right now.",
      response.status
    );
  }

  if (!body.data) {
    throw new ApiError("The server returned an unexpected response.", response.status);
  }

  return body.data;
}

export function formatPrice(price: number): string {
  const safePrice = Number.isFinite(price) ? price : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safePrice);
}
