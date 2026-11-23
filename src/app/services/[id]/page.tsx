import type { Metadata } from "next";
import { requireSession } from "@/lib/auth-server";
import ServiceDetails from "@/components/services/service-details";

export const instant = false;

export const metadata: Metadata = {
  title: "Service Details",
  description: "Explore the details of an approved wedding service on WedPlan.",
};

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      queryString.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => queryString.append(key, item));
    }
  }
  const returnPath = `/services/${encodeURIComponent(id)}${
    queryString.size > 0 ? `?${queryString.toString()}` : ""
  }`;

  await requireSession(returnPath);

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-345">
        <ServiceDetails id={id} />
      </div>
    </main>
  );
}
