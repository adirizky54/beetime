import { format } from "date-fns";

import { auth } from "@/lib/auth";

export function useFormatDate(date: Date | string, mode: "date" | "time" | "datetime" = "date") {
  const { data: activeOrg } = auth.useActiveOrganization();

  const dateToken = (() => {
    switch (activeOrg?.dateFormat) {
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
  })();

  const timeToken = (() => {
    switch (activeOrg?.timeFormat) {
      case "12-hours":
        return "h:mm a";
      case "24-hours":
        return "HH:mm";
      default:
        return "HH:mm";
    }
  })();

  const d = new Date(date);

  switch (mode) {
    case "date":
      return format(d, dateToken);
    case "time":
      return format(d, timeToken);
    case "datetime":
      return format(d, `${dateToken} ${timeToken}`);
  }
}
