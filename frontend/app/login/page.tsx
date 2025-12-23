"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleEmailLogin = () => {
    alert(`Login with email: ${email}`);
    // Logic to send the email to the backend
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login";
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4">
      {/* Dashboard-style container */}
      <div className="w-full max-w-4xl bg-white shadow-md rounded-xl p-12 border border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-12">

        {/* Left column: Logo + text */}
        <div className="flex flex-col items-center md:items-start md:w-1/2">
          <Image
            src="/logo.png"
            alt="xTariqi Logo"
            width={220}
            height={120}
            className="mb-6"
          />
          <h1 className="text-4xl font-bold text-[#0A2342] mb-4">
            Welcome <span className="text-[#FFD300]">👋</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-md">
            Sign in to access your space and simplify your procedures.
          </p>
        </div>

        {/* Right column: Email input + Google button */}
        <div className="flex flex-col items-center md:w-1/2 w-full">
          {/* Email input + button */}
          <div className="w-full max-w-sm mb-4 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
            />
            <button
              onClick={handleEmailLogin}
              className="w-full bg-[#FFD300] text-[#0A2342] font-semibold px-4 py-3 rounded-lg hover:bg-[#e6c700] transition"
            >
              Sign In
            </button>
          </div>

          {/* OR separator */}
          <div className="flex items-center w-full max-w-sm my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500 font-medium">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 px-10 py-4 w-full max-w-sm shadow-sm hover:shadow transition text-lg rounded-lg"
          >
            <Image
              src="/google-logo.png"
              alt="Google"
              width={26}
              height={26}
            />
            <span className="text-[#0A2342] font-medium">
              Sign in with Google
            </span>
          </button>

          {/* Back link */}
          <Link
            href="/"
            className="mt-6 text-sm font-medium text-[#0A2342] hover:text-[#FFD300] transition"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
