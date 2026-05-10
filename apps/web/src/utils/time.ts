import { format } from "date-fns";

import type { OrgDateFormat, OrgTimeFormat } from "@/lib/auth";

const DATE_FORMAT_MAP: Record<OrgDateFormat, string> = {
  "hyphen-separated-yyyy-mm-dd": "yyyy-MM-dd",
  "hyphen-separated-mm-dd-yyyy": "MM-dd-yyyy",
  "hyphen-separated-dd-mm-yyyy": "dd-MM-yyyy",
  "slash-separated-mm-dd-yyyy": "MM/dd/yyyy",
  "slash-separated-dd-mm-yyyy": "dd/MM/yyyy",
};

const TIME_FORMAT_MAP: Record<OrgTimeFormat, string> = {
  "12-hours": "h:mm a",
  "24-hours": "HH:mm",
};

const DEFAULT_DATE_FORMAT = "d MMM, yyyy";
const DEFAULT_TIME_FORMAT = "HH:mm";

function toDateToken(dateFormat: OrgDateFormat): string {
  return DATE_FORMAT_MAP[dateFormat] ?? DEFAULT_DATE_FORMAT;
}

function toTimeToken(timeFormat: OrgTimeFormat): string {
  return TIME_FORMAT_MAP[timeFormat] ?? DEFAULT_TIME_FORMAT;
}

export function formatDate(date: Date | string, dateFormat: OrgDateFormat): string {
  return format(new Date(date), toDateToken(dateFormat));
}

export function formatTime(date: Date | string, timeFormat: OrgTimeFormat): string {
  return format(new Date(date), toTimeToken(timeFormat));
}

export function formatDateTime(date: Date | string, dateFormat: OrgDateFormat, timeFormat: OrgTimeFormat): string {
  return format(new Date(date), `${toDateToken(dateFormat)} ${toTimeToken(timeFormat)}`);
}
