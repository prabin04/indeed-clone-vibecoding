import Link from "next/link";
import Navbar from "@/components/navbar";

const FEATURES = [
  {
    icon: "📋",
    title: "Post jobs in minutes",
    description:
      "Create detailed job listings with requirements, salary, and location. Go live instantly.",
  },
  {
    icon: "👥",
    title: "Collaborate as a team",
    description:
      "Invite recruiters and hiring managers to your organization. Work together in one place.",
  },
  {
    icon: "📥",
    title: "Manage applications",
    description:
      "Review candidates, track application status, and move top applicants to interview.",
  },
  {
    icon: "⭐",
    title: "Featured listings",
    description:
      "Boost your job postings to the top of search results and reach more qualified candidates.",
  },
  {
    icon: "📊",
    title: "Hiring analytics",
    description:
      "Track views, applications, and conversion rates to improve your hiring funnel.",
  },
  {
    icon: "🔒",
    title: "Secure and compliant",
    description:
      "Enterprise-grade security with role-based access controls for your whole team.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small companies getting started.",
    features: ["Up to 3 active job posts", "Basic applicant tracking", "1 team member"],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing teams hiring at scale.",
    features: [
      "Unlimited job posts",
      "Featured listings",
      "Up to 10 team members",
      "Advanced applicant tracking",
      "Priority support",
    ],
    cta: "Start Pro trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "/month",
    description: "For large organizations with complex needs.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Hiring analytics dashboard",
      "Custom roles & permissions",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function EmployerLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
            For Employers
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Hire smarter,<br />hire faster
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Post jobs, manage your team, and find the right candidates — all
            from one powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/employer/onboarding"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get started free
            </Link>
            <Link
              href="/employer/pricing"
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View pricing
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            No credit card required · Free plan available
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Everything you need to hire
          </h2>
          <p className="text-gray-500 text-center mb-12">
            A complete hiring platform built for modern teams.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="p-6 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Start free. Upgrade as you grow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(({ name, price, period, description, features, cta, highlighted }) => (
              <div
                key={name}
                className={`rounded-xl p-6 border ${
                  highlighted
                    ? "bg-blue-700 border-blue-700 text-white shadow-xl scale-105"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`font-bold text-lg mb-1 ${highlighted ? "text-white" : "text-gray-900"}`}
                >
                  {name}
                </h3>
                <p
                  className={`text-sm mb-4 ${highlighted ? "text-blue-200" : "text-gray-500"}`}
                >
                  {description}
                </p>
                <div className="flex items-end gap-1 mb-6">
                  <span
                    className={`text-3xl font-bold ${highlighted ? "text-white" : "text-gray-900"}`}
                  >
                    {price}
                  </span>
                  {period && (
                    <span
                      className={`text-sm mb-1 ${highlighted ? "text-blue-200" : "text-gray-500"}`}
                    >
                      {period}
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-2 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span
                        className={`mt-0.5 ${highlighted ? "text-blue-200" : "text-green-500"}`}
                      >
                        ✓
                      </span>
                      <span className={highlighted ? "text-blue-100" : "text-gray-600"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/employer/onboarding"
                  className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    highlighted
                      ? "bg-white text-blue-700 hover:bg-blue-50"
                      : "bg-blue-700 text-white hover:bg-blue-800"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            Billing is managed through Clerk + Stripe. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to find your next great hire?
          </h2>
          <p className="text-gray-500 mb-6">
            Join thousands of companies already using Jobly.
          </p>
          <Link
            href="/employer/onboarding"
            className="inline-block bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Create your employer account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 px-4 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} Jobly · For Job Seekers:{" "}
        <Link href="/jobs" className="hover:text-gray-300 underline">
          Browse Jobs
        </Link>
      </footer>
    </div>
  );
}
