import { defineField, defineType } from "sanity";

/** Singleton (one document, id "houseSiteSettings") — contact details and
 *  the "what's included" list shown across the site. */
export default defineType({
  name: "houseSiteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "phone",
      title: "Phone number",
      type: "string",
      description: "Shown in the header and on every house page, e.g. +998 77 000 16 00.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "telegram",
      title: "Telegram username",
      type: "string",
      description: "Without the @, e.g. castler_uz. Leave empty to hide the Telegram button.",
      validation: (Rule) =>
        Rule.custom((v) => (!v || /^[A-Za-z0-9_]{4,32}$/.test(v) ? true : "Letters, numbers and _ only, without @.")),
    }),
    defineField({ name: "instagram", title: "Instagram link", type: "url" }),
    defineField({ name: "address", title: "Office address", type: "localizedString" }),
    defineField({
      name: "included",
      title: "What every house plan includes",
      type: "localizedStringList",
      description: "One line per item. Shown on the home page and every house page. Leave empty to hide.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
