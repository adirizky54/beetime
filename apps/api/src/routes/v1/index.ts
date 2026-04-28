import { createRouter } from "@/lib/app";
import { authRoutes } from "./auth";
import { organizationsRoutes } from "./organizations";

export const v1Routes = createRouter();

// Mount v1 routes
v1Routes.route("/auth", authRoutes);
v1Routes.route("/organizations", organizationsRoutes);
