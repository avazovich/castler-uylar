import type { SchemaTypeDefinition } from "sanity";
import housePlan from "./housePlan";
import { localizedString, localizedStringList, localizedText } from "./localized";
import siteSettings from "./siteSettings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [housePlan, siteSettings, localizedString, localizedText, localizedStringList],
};
