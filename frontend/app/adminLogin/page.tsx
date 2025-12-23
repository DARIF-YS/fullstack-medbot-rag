"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await fetch("http://localhost:8000/admin/login", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      localStorage.setItem("admin_token", data.access_token);
      router.push("/adminDash");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white px-4">
      {/* Dashboard-style container */}
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-10 border border-gray-200 flex flex-col items-center gap-6">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="xTariqi Logo"
          width={180}
          height={100}
          className="mb-4"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#0A2342]">Admin Login</h1>
        <p className="text-gray-600 text-center">
          Sign in to access the administrator dashboard.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD300]"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#FFD300] text-[#0A2342] font-semibold px-4 py-3 rounded-lg hover:bg-[#e6c700] transition"
          >
            Sign In
          </button>
          {error && <p className="text-red-600 text-center">{error}</p>}
        </form>

        {/* Back link */}
        <p className="mt-4 text-sm text-gray-600 text-center">
          <a href="/" className="hover:text-[#FFD300] transition">
            ← Back to home
          </a>
        </p>
      </div>
    </main>
  );
}
