import { createRouter } from "@/lib/app";
import { authRoutes } from "./auth";
import { meRoutes } from "./me";
import { organizationsRoutes } from "./organizations";

export const v1Routes = createRouter();

// Mount v1 routes
v1Routes.route("/auth", authRoutes);
v1Routes.route("/me", meRoutes);
v1Routes.route("/organizations", organizationsRoutes);
