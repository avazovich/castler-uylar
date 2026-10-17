import { defineType } from "sanity";

/**
 * Uzbek is the original; Russian is optional and falls back to Uzbek on
 * the Russian site when left empty (see `pick` in lib/houses.ts).
 */
export const localizedString = defineType({
  name: "localizedString",
  title: "Text",
  type: "object",
  fields: [
    { name: "uz", title: "O'zbekcha", type: "string" },
    { name: "ru", title: "Русский (optional — falls back to Uzbek)", type: "string" },
  ],
  preview: { select: { title: "uz" } },
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Paragraph",
  type: "object",
  fields: [
    { name: "uz", title: "O'zbekcha", type: "text", rows: 4 },
    { name: "ru", title: "Русский (optional — falls back to Uzbek)", type: "text", rows: 4 },
  ],
});

export const localizedStringList = defineType({
  name: "localizedStringList",
  title: "List",
  type: "object",
  fields: [
    { name: "uz", title: "O'zbekcha", type: "array", of: [{ type: "string" }] },
    { name: "ru", title: "Русский (optional — falls back to Uzbek)", type: "array", of: [{ type: "string" }] },
  ],
});
