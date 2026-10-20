import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, static files, /studio (the embedded
  // Sanity Studio) and /admin — both live outside the [locale] tree on purpose.
  matcher: ["/((?!api|_next|_vercel|studio|admin|.*\\..*).*)"],
};
