export type ParsedUserAgent = {
  browser: string;
  os: string;
  device: string;
};

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) {
    return { browser: "Unknown", os: "Unknown", device: "Unknown" };
  }

  // device
  let device: string;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua)) {
      device = "Tablet";
    } else {
      device = "Mobile";
    }
  } else {
    device = "Desktop";
  }

  // browser
  let browser: string;
  if (ua.includes("Edg/")) {
    browser = "Edge";
  } else if (ua.includes("OPR/") || ua.includes("Opera")) {
    browser = "Opera";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
  } else if (ua.includes("Firefox/")) {
    browser = "Firefox";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome/")) {
    browser = "Safari";
  } else if (ua.includes("MSIE") || ua.includes("Trident/")) {
    browser = "Internet Explorer";
  } else {
    browser = "Unknown";
  }

  // os
  let os: string;
  if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
  } else if (ua.includes("Android")) {
    os = "Android";
  } else if (ua.includes("Windows NT")) {
    os = "Windows";
  } else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) {
    os = "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else {
    os = "Unknown";
  }

  return { browser, os, device };
}
