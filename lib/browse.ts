export const browseSections = ["styles", "collections", "size", "cost", "guides", "faq", "consult"] as const;
export type BrowseSection = (typeof browseSections)[number];
export const browsePath = (section: BrowseSection) => `/browse/${section}`;
