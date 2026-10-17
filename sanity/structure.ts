import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("housePlan")
        .title("House plans")
        .child(
          S.documentTypeList("housePlan")
            .title("House plans")
            .defaultOrdering([{ field: "code", direction: "desc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .id("houseSiteSettings")
        .child(S.document().schemaType("houseSiteSettings").documentId("houseSiteSettings").title("Site settings")),
    ]);
