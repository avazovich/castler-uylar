import { defineArrayMember, defineField, defineType } from "sanity";
import { apiVersion } from "../env";
import {
  COST_PARTS,
  FLOOR_OPTIONS,
  LEVELS,
  ROOM_TYPES,
  STYLES,
  studioOptions,
} from "../../lib/vocab";

const formatSom = (n?: number) => (n == null ? "" : `${n.toLocaleString("ru-RU")} so'm`);

export default defineType({
  name: "housePlan",
  title: "House plan",
  type: "document",
  groups: [
    { name: "main", title: "Main", default: true },
    { name: "photos", title: "Photos" },
    { name: "plans", title: "Floor plans" },
    { name: "cost", title: "Build cost" },
  ],
  fields: [
    defineField({
      name: "code",
      title: "Catalog number",
      type: "number",
      group: "main",
      description: "Shown as “№ 101” and used in the page address. Must be unique.",
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .custom(async (code, context) => {
            if (code == null) return true;
            const id = (context.document?._id ?? "").replace(/^drafts\./, "");
            const taken = await context
              .getClient({ apiVersion })
              .fetch<number>(
                `count(*[_type == "housePlan" && code == $code && !(_id in [$id, $draftId])])`,
                { code, id, draftId: `drafts.${id}` },
              );
            return taken === 0 ? true : `№ ${code} is already used by another house.`;
          }),
    }),
    defineField({
      name: "name",
      title: "Name (optional)",
      type: "localizedString",
      group: "main",
      description: "A short name, e.g. “Afsona”. Without one the site shows “Loyiha № 101”.",
    }),
    defineField({
      name: "isSample",
      title: "Sample data",
      type: "boolean",
      group: "main",
      initialValue: false,
      description:
        "Tick while the sizes and prices are placeholders — the site then shows a “Namuna” (sample) badge. Untick once the real numbers are in.",
    }),
    defineField({
      name: "featured",
      title: "Show on the home page",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      group: "main",
      options: { list: studioOptions(STYLES), layout: "radio", direction: "horizontal" },
    }),
    defineField({
      name: "priceUzs",
      title: "Price (so'm)",
      type: "number",
      group: "main",
      description: "Price of the design documents, in so'm.",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "oldPriceUzs",
      title: "Old price (optional, so'm)",
      type: "number",
      group: "main",
      description: "Shown crossed out next to the price. Leave empty for no discount.",
      validation: (Rule) =>
        Rule.min(0).custom((old, context) => {
          const price = (context.document as { priceUzs?: number } | undefined)?.priceUzs;
          if (old == null || price == null) return true;
          return old > price ? true : "The old price should be higher than the price.";
        }),
    }),
    defineField({
      name: "plotSotix",
      title: "Plot size needed (sotix)",
      type: "number",
      group: "main",
      description: "Smallest plot the house fits on. 1 sotix = 100 m².",
      validation: (Rule) => Rule.required().min(0.5),
    }),
    defineField({
      name: "minPlotWidth",
      title: "Plot width needed (m)",
      type: "number",
      group: "main",
      description: "Narrowest plot frontage the house fits on, in metres. Used by the “plot width” filter.",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "minPlotLength",
      title: "Plot depth needed (m, optional)",
      type: "number",
      group: "main",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "totalArea",
      title: "Total floor area (m²)",
      type: "number",
      group: "main",
      validation: (Rule) => Rule.required().min(10),
    }),
    defineField({
      name: "floors",
      title: "Floors",
      type: "number",
      group: "main",
      options: { list: FLOOR_OPTIONS.map((n) => ({ value: n, title: String(n) })), layout: "radio", direction: "horizontal" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (optional)",
      type: "localizedText",
      group: "main",
    }),

    defineField({
      name: "cover",
      title: "Main photo",
      type: "image",
      group: "photos",
      description: "Shown on the catalog card. An exterior view works best.",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "More photos",
      type: "array",
      group: "photos",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
      options: { layout: "grid" },
    }),

    defineField({
      name: "floorPlans",
      title: "Floor plans",
      type: "array",
      group: "plans",
      description: "One entry per floor: the drawing (optional) and its rooms with areas.",
      of: [
        defineArrayMember({
          type: "object",
          name: "floorPlan",
          fields: [
            defineField({
              name: "level",
              title: "Floor",
              type: "string",
              options: { list: studioOptions(LEVELS) },
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "plan", title: "Plan drawing (optional)", type: "image" }),
            defineField({
              name: "rooms",
              title: "Rooms",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "room",
                  fields: [
                    defineField({
                      name: "type",
                      title: "Room",
                      type: "string",
                      options: { list: studioOptions(ROOM_TYPES) },
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "customName",
                      title: "Room name",
                      type: "localizedString",
                      hidden: ({ parent }) => parent?.type !== "other",
                    }),
                    defineField({
                      name: "area",
                      title: "Area (m²)",
                      type: "number",
                      validation: (Rule) => Rule.required().min(0.5),
                    }),
                  ],
                  preview: {
                    select: { type: "type", custom: "customName.uz", area: "area" },
                    prepare: ({ type, custom, area }) => ({
                      title: custom || ROOM_TYPES[type as keyof typeof ROOM_TYPES]?.uz || "Room",
                      subtitle: area ? `${area} m²` : undefined,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { level: "level", rooms: "rooms", plan: "plan" },
            prepare: ({ level, rooms, plan }) => {
              const list = (rooms ?? []) as { area?: number }[];
              const total = list.reduce((s, r) => s + (r.area ?? 0), 0);
              return {
                title: LEVELS[level as keyof typeof LEVELS]?.uz ?? "Floor",
                subtitle: `${list.length} rooms · ${Math.round(total * 10) / 10} m²`,
                media: plan,
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: "buildEstimate",
      title: "Build cost estimate (USD)",
      type: "array",
      group: "cost",
      description: "Rough cost of building the shell, part by part, in US dollars. Leave empty to hide the section.",
      of: [
        defineArrayMember({
          type: "object",
          name: "costLine",
          fields: [
            defineField({
              name: "part",
              title: "Part",
              type: "string",
              options: { list: studioOptions(COST_PARTS) },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "customPart",
              title: "Part name",
              type: "localizedString",
              hidden: ({ parent }) => parent?.part !== "other",
            }),
            defineField({ name: "area", title: "Area (m², optional)", type: "number" }),
            defineField({
              name: "costUsd",
              title: "Cost (USD)",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            }),
          ],
          preview: {
            select: { part: "part", custom: "customPart.uz", cost: "costUsd", area: "area" },
            prepare: ({ part, custom, cost, area }) => ({
              title: custom || COST_PARTS[part as keyof typeof COST_PARTS]?.uz || "Part",
              subtitle: [area ? `${area} m²` : null, cost != null ? `$${cost.toLocaleString("en-US")}` : null]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),
  ],
  orderings: [
    { title: "Catalog number, newest first", name: "codeDesc", by: [{ field: "code", direction: "desc" }] },
  ],
  preview: {
    select: { code: "code", name: "name.uz", price: "priceUzs", media: "cover", isSample: "isSample" },
    prepare: ({ code, name, price, media, isSample }) => ({
      title: `№ ${code ?? "—"}${name ? ` · ${name}` : ""}`,
      subtitle: [formatSom(price), isSample ? "SAMPLE" : null].filter(Boolean).join(" · "),
      media,
    }),
  },
});
