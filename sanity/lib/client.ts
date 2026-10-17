import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Published content only, read live (not the CDN) so an editor's change
  // shows up on the next page refresh rather than up to a minute later.
  useCdn: false,
  perspective: "published",
});
