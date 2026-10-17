import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, static files, and /studio (the
  // embedded Sanity Studio lives outside the [locale] tree on purpose).
  matcher: ["/((?!api|_next|_vercel|studio|.*\\..*).*)"],
};
