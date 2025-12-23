"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FaGlobe,
  FaComments,
  FaVolumeUp,
  FaFolderOpen,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white text-[#0A2342] min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-4 shadow-md sticky top-0 bg-white z-50">
        <Image src="/logo.png" alt="MedBot Logo" width={140} height={50} />

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 font-medium text-gray-700">
          <li>
            <a href="#hero" className="hover:text-[#FFD300] transition">
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="hover:text-[#FFD300] transition">
              Features
            </a>
          </li>
          <li>
            <a href="#about" className="hover:text-[#FFD300] transition">
              About
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-[#FFD300] transition">
              Contact
            </a>
          </li>
        </ul>

        {/* Login */}
        <div className="hidden md:flex">
          <a
            href="/login"
            className="bg-[#FFD300] text-[#0A2342] px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition"
          >
            Login
          </a>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button
            className="text-3xl text-[#0A2342]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4 text-gray-700 font-medium">
          <a href="#hero" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          <a
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block bg-[#FFD300] text-[#0A2342] px-4 py-2 rounded-lg font-semibold text-center"
          >
            Login
          </a>
        </div>
      )}

      {/* Hero Section */}
      <section
        id="hero"
        className="flex flex-col md:flex-row items-center justify-between px-6 py-24 bg-gradient-to-r from-[#FFD300]/15 via-white to-[#FFD300]/15"
      >
        <div className="w-full md:w-1/2 text-center md:text-left mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Your Smart Medical Assistant{" "}
            <span className="text-[#FFD300]">MedBot</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-700">
            Get instant, reliable medical guidance powered by artificial
            intelligence. Ask questions, describe symptoms, and receive helpful
            insights anytime.
          </p>
          <a
            href="/login"
            className="bg-[#FFD300] text-[#0A2342] px-8 py-3 rounded-2xl text-lg font-semibold shadow-lg hover:bg-yellow-400 transition"
          >
            Start Chatting
          </a>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src="/hero-image.png"
            alt="MedBot Illustration"
            width={600}
            height={400}
            className="rounded-2xl"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose MedBot?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {[
            {
              icon: <FaGlobe />,
              title: "Multilingual Support",
              desc: "Communicate in English, French, or Arabic effortlessly.",
            },
            {
              icon: <FaComments />,
              title: "Instant Medical Answers",
              desc: "Get fast responses to health-related questions.",
            },
            {
              icon: <FaVolumeUp />,
              title: "Voice & Text Interaction",
              desc: "Speak or type your questions as you prefer.",
            },
            {
              icon: <FaFolderOpen />,
              title: "Conversation History",
              desc: "Access your previous medical discussions anytime.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-4 p-6 rounded-2xl shadow bg-white hover:shadow-xl transition"
            >
              <div className="text-[#FFD300] text-4xl">{item.icon}</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="px-6 py-20 bg-gray-50 text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-6">About MedBot</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          MedBot is an AI-powered medical chatbot designed to assist users with
          general health information, symptom analysis, and medical guidance.
          It does not replace doctors but helps you make informed decisions.
        </p>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="px-6 py-20 bg-white text-center max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className="text-gray-700 text-lg mb-8">
          Have questions or feedback? Reach out to us anytime.
        </p>

        <form className="grid gap-6 text-left">
          <input type="text" placeholder="Your name" className="p-3 border rounded-xl" required />
          <input type="email" placeholder="Your email" className="p-3 border rounded-xl" required />
          <textarea rows={4} placeholder="Your message" className="p-3 border rounded-xl" required />
          <button className="bg-[#FFD300] text-[#0A2342] px-6 py-3 rounded-xl font-semibold">
            Send Message
          </button>
        </form>

        <div className="mt-10 flex justify-center space-x-6 text-3xl text-[#FFD300]">
          <FaFacebook />
          <FaInstagram />
          <FaLinkedin />
          <FaTwitter />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2342] text-white text-center py-8 mt-auto">
        <p>© 2025 MedBot. All rights reserved.</p>
      </footer>
    </div>
  );
}
