import { cache } from "react";
import {
  FEATURED_SERVICES_LIMIT,
  getFeaturedServices,
} from "./featured-services-api";

export const getHomepageFeaturedServices = cache(() =>
  getFeaturedServices(FEATURED_SERVICES_LIMIT)
);
