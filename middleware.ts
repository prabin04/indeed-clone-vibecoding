import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isEmployerDashboard = createRouteMatcher(["/employer/dashboard(.*)"]);
const isApplyRoute = createRouteMatcher(["/jobs/apply(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Both employer dashboard and apply routes require authentication
  if (isEmployerDashboard(req) || isApplyRoute(req)) {
    await auth.protect();
  }

  // Employer dashboard also requires an active organization.
  // Redirect to onboarding if the user hasn't created/joined one yet.
  if (isEmployerDashboard(req)) {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.redirect(new URL("/employer/onboarding", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|tiff?|bmp|xml|woff2?|ttf|eot|png|jpe?g|gif|svg|ico|webp|avif|woff)).*)",
    "/(api|trpc)(.*)",
  ],
};
