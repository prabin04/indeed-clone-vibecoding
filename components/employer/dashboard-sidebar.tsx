"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Overview", href: "/employer/dashboard", icon: "▦", exact: true },
  { label: "Jobs", href: "/employer/dashboard/jobs", icon: "📋", exact: false },
  { label: "Applications", href: "/employer/dashboard/applications", icon: "📥", exact: false },
  { label: "Members", href: "/employer/dashboard/members", icon: "👥", exact: false },
  { label: "Billing", href: "/employer/dashboard/billing", icon: "💳", exact: false },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { membership } = useOrganization();
  const isAdmin = membership?.role === "org:admin";

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-blue-700 tracking-tight">
          Jobly
        </Link>
      </div>

      {/* Org switcher */}
      <div className="px-4 py-3 border-b border-gray-100">
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/employer/dashboard"
          afterCreateOrganizationUrl="/employer/pricing"
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm",
            },
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon, exact }) => {
            // Hide Billing link for non-admins
            if (label === "Billing" && !isAdmin) return null;

            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-base leading-none">{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer links */}
      <div className="px-3 py-3 border-t border-gray-100 flex flex-col gap-0.5">
        <Link
          href="/employer/pricing"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <span className="text-base leading-none">⬆</span>
          Upgrade Plan
        </Link>
        <Link
          href="/jobs"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <span className="text-base leading-none">←</span>
          Browse Jobs
        </Link>
      </div>
    </aside>
  );
}
