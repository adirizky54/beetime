import { format, isSameDay, isSameMonth, isSameYear, isToday } from "date-fns";

/**
 * Formats a date range into a human-readable string.
 *
 * - Same day as today:       "1 Jan, 2026"
 * - Same month:              "1 - 7 Jan, 2026"
 * - Across months:           "Mar 6 - Apr 7, 2026"
 * - Across years:            "Dec 24, 2025 - Jan 1, 2026"
 */
export function formatDateRange(from: Date, to: Date) {
  if (isSameDay(from, to) && isToday(from)) {
    return format(from, "d MMM, yyyy");
  }

  if (isSameYear(from, to)) {
    if (isSameMonth(from, to)) {
      return `${format(from, "d")} - ${format(to, "d MMM, yyyy")}`;
    }
    return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
  }

  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
