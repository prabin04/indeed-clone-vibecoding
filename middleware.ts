import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isEmployerDashboard = createRouteMatcher(["/employer/dashboard(.*)"]);
const isApplyRoute = createRouteMatcher(["/jobs/apply(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isEmployerDashboard(req) || isApplyRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|tiff?|bmp|xml|woff2?|ttf|eot|png|jpe?g|gif|svg|ico|webp|avif|woff)).*)",
    "/(api|trpc)(.*)",
  ],
};
