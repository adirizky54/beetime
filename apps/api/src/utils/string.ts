import slugify from "slugify";

export const toSlug = (text: string, suffix?: string) => {
  return (
    slugify(text, {
      lower: true,
      strict: true,
      trim: true,
    }) + (suffix ? `-${suffix}` : "")
  );
};