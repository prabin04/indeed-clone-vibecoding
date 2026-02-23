"use client";

import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-700 tracking-tight">
          Jobly
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Find Jobs
          </Link>
          <Link href="/employer" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            For Employers
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-blue-700 border border-blue-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-800 transition-colors">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/employer/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium mr-2"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
