import type { HTTPError } from "ky";
import type { ResponseApiError } from "./lib/api";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: HTTPError<ResponseApiError>;
  }
}
