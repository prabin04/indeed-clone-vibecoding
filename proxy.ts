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
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
