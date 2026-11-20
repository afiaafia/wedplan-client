import type { Metadata } from "next";
import ServiceDetails from "@/components/services/service-details";

export const instant = false;

export const metadata: Metadata = {
  title: "Service Details",
  description: "Explore the details of an approved wedding service on WedPlan.",
};

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1380px]">
        <ServiceDetails id={id} />
      </div>
    </main>
  );
}
