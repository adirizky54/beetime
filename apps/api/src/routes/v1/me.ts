import { createRouter } from "@/lib/app";
import * as meService from "@/services/me";

export const meRoutes = createRouter();

meRoutes.get("/", async (c) => {
  const result = await meService.getCurrentUser(c.req.raw.headers);

  return c.json(
    {
      data: result,
      message: "User retrieved successfully",
    },
    200,
  );
});
