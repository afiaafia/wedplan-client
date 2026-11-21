import type { ServiceCategory } from "@/lib/services-api";

export type HomeCategoryIcon =
  | "photography"
  | "venue"
  | "decoration"
  | "catering"
  | "makeup"
  | "fashion";

export interface HomeCategory {
  label: string;
  category: ServiceCategory;
  values: readonly ServiceCategory[];
  description: string;
  image: string;
  icon: HomeCategoryIcon;
}

export const HOME_CATEGORIES: readonly HomeCategory[] = [
  {
    label: "Photography & Videography",
    category: "Photography",
    values: ["Photography", "Videography"],
    description: "Capture every moment",
    image: "https://i.ibb.co/4Z6K6k6R/wedplan-photography.jpg",
    icon: "photography",
  },
  {
    label: "Wedding Venues",
    category: "Wedding Venue",
    values: ["Wedding Venue"],
    description: "Find your perfect setting",
    image: "https://i.ibb.co/WWWv51vW/wedplan-venue.jpg",
    icon: "venue",
  },
  {
    label: "Decoration & Florist",
    category: "Decoration",
    values: ["Decoration"],
    description: "Style the celebration",
    image: "https://i.ibb.co/RGSVbZtx/wedplan-decoration.jpg",
    icon: "decoration",
  },
  {
    label: "Catering Services",
    category: "Catering",
    values: ["Catering"],
    description: "Delight every guest",
    image: "https://i.ibb.co/Z1Kw82b1/wedplan-catering.jpg",
    icon: "catering",
  },
  {
    label: "Makeup & Styling",
    category: "Makeup & Beauty",
    values: ["Makeup & Beauty"],
    description: "Feel your best",
    image: "https://i.ibb.co/9k6nXxxQ/wedplan-makeup.jpg",
    icon: "makeup",
  },
  {
    label: "Wedding Fashion",
    category: "Wedding Fashion",
    values: ["Wedding Fashion"],
    description: "Discover your look",
    image: "https://i.ibb.co/9mBLzND0/wedplan-wedding-fashion.jpg",
    icon: "fashion",
  },
];

export function categoryParam(category: HomeCategory): string {
  return category.values.join(",");
}

export function categoryHref(category: ServiceCategory): string {
  const params = new URLSearchParams({ category });
  return `/services?${params.toString()}`;
}

export function homeCategoryHref(category: HomeCategory): string {
  const params = new URLSearchParams({ category: categoryParam(category) });
  return `/services?${params.toString()}`;
}
