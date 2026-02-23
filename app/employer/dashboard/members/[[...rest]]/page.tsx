"use client";

import { OrganizationProfile, useOrganization } from "@clerk/nextjs";

export default function MembersPage() {
  const { organization, isLoaded } = useOrganization();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isLoaded && organization
            ? `Manage members and roles for ${organization.name}.`
            : "Manage members, roles, and invitations for your organization."}
        </p>
      </div>

      {/* Clerk handles all invite/manage/role functionality */}
      <OrganizationProfile
        routing="path"
        path="/employer/dashboard/members"
        appearance={{
          elements: {
            card: "shadow-none border-0 p-0 w-full",
            rootBox: "w-full",
            pageScrollBox: "p-0",
          },
        }}
      />
    </div>
  );
}
