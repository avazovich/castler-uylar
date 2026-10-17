import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const SINGLETON_TYPES = new Set(["houseSiteSettings"]);

// Same Sanity project/dataset as castler.uz, so the house photos can reuse
// images already uploaded there. This Studio only shows house-plan content.
export default defineConfig({
  name: "castler-uylar",
  title: "Castler — Uy loyihalari",
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure })],
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((t) => !SINGLETON_TYPES.has(t.templateId)) : prev,
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? prev.filter((a) => a.action !== "duplicate" && a.action !== "delete")
        : prev,
  },
});
