import { getServerApiBaseUrl } from "./api-url.ts";
import {
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "./services-api.ts";

export const FEATURED_SERVICES_LIMIT = 6;
export const FEATURED_SERVICES_LIST_HREF = "/services";

export interface FeaturedVendor {
  id: string;
  name?: string;
  profileImage?: string;
  businessName?: string;
}

export interface FeaturedService {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  location: string;
  price: number;
  images: string[];
  isActive: boolean;
  approvalStatus: "approved";
  createdAt: string;
  vendor: FeaturedVendor | null;
}

export interface FeaturedServicesResponse {
  success: true;
  data: {
    services: FeaturedService[];
    total: number;
  };
  meta: {
    limit: number;
  };
}

export class FeaturedServicesApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "FeaturedServicesApiError";
    this.status = status;
  }
}

function optionalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function text(value: unknown): string {
  return optionalText(value) ?? "";
}

function images(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
}

function category(value: unknown): ServiceCategory {
  return SERVICE_CATEGORIES.includes(value as ServiceCategory)
    ? (value as ServiceCategory)
    : "Other";
}

function price(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function vendor(value: unknown): FeaturedVendor | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const id = optionalText(record.id);
  if (!id) return null;

  const name = optionalText(record.name);
  const profileImage = optionalText(record.profileImage);
  const businessName = optionalText(record.businessName);

  return {
    id,
    ...(name ? { name } : {}),
    ...(profileImage ? { profileImage } : {}),
    ...(businessName ? { businessName } : {}),
  };
}

export function toFeaturedService(value: unknown): FeaturedService | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const id = optionalText(record.id);
  if (!id || record.approvalStatus !== "approved" || record.isActive !== true) {
    return null;
  }

  return {
    id,
    title: text(record.title),
    category: category(record.category),
    description: text(record.description),
    location: text(record.location),
    price: price(record.price),
    images: images(record.images),
    isActive: true,
    approvalStatus: "approved",
    createdAt: text(record.createdAt),
    vendor: vendor(record.vendor),
  };
}

export function parseFeaturedServicesResponse(
  body: unknown,
  status = 200
): FeaturedServicesResponse {
  if (!body || typeof body !== "object") {
    throw new FeaturedServicesApiError(
      "The server returned an unexpected response.",
      status
    );
  }

  const response = body as Record<string, unknown>;
  const data = response.data as Record<string, unknown> | undefined;

  if (
    response.success !== true ||
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.services) ||
    typeof data.total !== "number"
  ) {
    throw new FeaturedServicesApiError(
      "The server returned an unexpected response.",
      status
    );
  }

  return {
    success: true,
    data: {
      services: data.services
        .map(toFeaturedService)
        .filter((service): service is FeaturedService => service !== null),
      total: data.total,
    },
    meta: {
      limit:
        typeof (response.meta as Record<string, unknown> | undefined)?.limit ===
        "number"
          ? ((response.meta as Record<string, unknown>).limit as number)
          : FEATURED_SERVICES_LIMIT,
    },
  };
}

export async function getFeaturedServices(
  limit: number = FEATURED_SERVICES_LIMIT
): Promise<FeaturedServicesResponse> {
  const baseUrl = getServerApiBaseUrl();

  let response: Response;
  try {
    response = await fetch(
      `${baseUrl}/api/services/featured?limit=${encodeURIComponent(String(limit))}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );
  } catch {
    throw new FeaturedServicesApiError("Unable to reach the services API.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new FeaturedServicesApiError(
      "The server returned an invalid response.",
      response.status
    );
  }

  if (!response.ok) {
    const error = (body as { error?: { message?: string } } | null)?.error;
    throw new FeaturedServicesApiError(
      error?.message || "Unable to load featured services right now.",
      response.status
    );
  }

  return parseFeaturedServicesResponse(body, response.status);
}

export function firstAvailableImage(
  images: string[],
  failedImages: readonly string[] = []
): string | undefined {
  return images.find(
    (image) =>
      typeof image === "string" && image.trim().length > 0 && !failedImages.includes(image)
  );
}

export function featuredServiceHref(id: string): string {
  return `/services/${encodeURIComponent(id)}`;
}

export function hasFeaturedServices(
  response: FeaturedServicesResponse
): boolean {
  return response.data.services.length > 0;
}
