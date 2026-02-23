import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk issuer URL from your "convex" JWT template in the Clerk Dashboard.
      // Set CLERK_JWT_ISSUER_DOMAIN in .env.local AND in the Convex dashboard.
      // Clerk Dashboard → JWT Templates → New template → name it "convex" → copy Issuer URL
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
