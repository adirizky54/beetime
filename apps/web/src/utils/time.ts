import { format } from "date-fns";

import type { OrgDateFormat, OrgTimeFormat } from "@/lib/auth";

function toDateToken(dateFormat: OrgDateFormat | null | undefined): string {
  switch (dateFormat) {
    case "hyphen-separated-yyyy-mm-dd":
      return "yyyy-MM-dd";
    case "hyphen-separated-mm-dd-yyyy":
      return "MM-dd-yyyy";
    case "hyphen-separated-dd-mm-yyyy":
      return "dd-MM-yyyy";
    case "slash-separated-mm-dd-yyyy":
      return "MM/dd/yyyy";
    case "slash-separated-dd-mm-yyyy":
      return "dd/MM/yyyy";
    default:
      return "d MMM, yyyy";
  }
}

function toTimeToken(timeFormat: OrgTimeFormat | null | undefined): string {
  switch (timeFormat) {
    case "12-hours":
      return "h:mm a";
    case "24-hours":
      return "HH:mm";
    default:
      return "HH:mm";
  }
}

export function formatDate(date: Date | string, dateFormat: OrgDateFormat | null | undefined): string {
  return format(new Date(date), toDateToken(dateFormat));
}

export function formatTime(date: Date | string, timeFormat: OrgTimeFormat | null | undefined): string {
  return format(new Date(date), toTimeToken(timeFormat));
}

export function formatDateTime(
  date: Date | string,
  dateFormat: OrgDateFormat | null | undefined,
  timeFormat: OrgTimeFormat | null | undefined,
): string {
  return format(new Date(date), `${toDateToken(dateFormat)} ${toTimeToken(timeFormat)}`);
}
