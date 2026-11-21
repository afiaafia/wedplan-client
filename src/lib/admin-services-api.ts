import { VENDOR_API_BASE_URL } from "./vendor-api.ts";
import type { VendorService } from "./vendor-dashboard.ts";

export type AdminApprovalStatus = "pending" | "approved" | "rejected";

export class AdminServicesApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status = 0, code = "UNEXPECTED_RESPONSE") {
    super(message);
    this.name = "AdminServicesApiError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseService(value: unknown): VendorService {
  if (!isRecord(value)) {
    throw new AdminServicesApiError("The server returned an unexpected service record.");
  }

  const approval = value.approvalStatus;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.category !== "string" ||
    typeof value.description !== "string" ||
    typeof value.location !== "string" ||
    typeof value.price !== "number" ||
    !Array.isArray(value.images) ||
    (approval !== "pending" && approval !== "approved" && approval !== "rejected") ||
    typeof value.isActive !== "boolean" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    throw new AdminServicesApiError("The server returned an unexpected service record.");
  }

  return value as unknown as VendorService;
}

export function parseServicesForReviewResponse(body: unknown): VendorService[] {
  if (!isRecord(body) || body.success !== true || !Array.isArray(body.data)) {
    throw new AdminServicesApiError("The server returned an unexpected services response.");
  }

  return body.data.map(parseService);
}

export function parseApprovalResponse(body: unknown): VendorService {
  if (!isRecord(body) || body.success !== true) {
    throw new AdminServicesApiError("The server returned an unexpected approval response.");
  }

  return parseService(body.data);
}

async function request(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${VENDOR_API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new AdminServicesApiError("Unable to reach the services API.", 0, "NETWORK");
  }
}

export async function getServicesForReview(): Promise<VendorService[]> {
  const response = await request("/api/admin/services", { method: "GET" });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const code = isRecord(body) && isRecord(body.error) && typeof body.error.code === "string"
      ? body.error.code
      : "UNKNOWN";
    const message = isRecord(body) && isRecord(body.error) && typeof body.error.message === "string"
      ? body.error.message
      : "Unable to load services for review.";
    throw new AdminServicesApiError(message, response.status, code);
  }

  return parseServicesForReviewResponse(body);
}

export async function setServiceApproval(
  id: string,
  approvalStatus: AdminApprovalStatus,
  rejectionReason?: string
): Promise<VendorService> {
  const response = await request(
    `/api/admin/services/${encodeURIComponent(id)}/approval`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvalStatus,
        ...(rejectionReason ? { rejectionReason } : {}),
      }),
    }
  );
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const code = isRecord(body) && isRecord(body.error) && typeof body.error.code === "string"
      ? body.error.code
      : "UNKNOWN";
    const message = isRecord(body) && isRecord(body.error) && typeof body.error.message === "string"
      ? body.error.message
      : "Unable to update the approval status.";
    throw new AdminServicesApiError(message, response.status, code);
  }

  return parseApprovalResponse(body);
}
