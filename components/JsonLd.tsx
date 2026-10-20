/** schema.org data for search engines. `<` is escaped so text from the
 *  editor can never close the script tag (Next.js JSON-LD guidance). */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
