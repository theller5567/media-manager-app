"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/demo", label: "Demo" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-center gap-2">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Synapse
          </Link>
          <p className="text-slate-400 text-sm font-medium">The media library that thinks like you.</p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/demo"
              className="bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/25"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-slate-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/demo"
              className="block bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-600 hover:via-indigo-600 hover:to-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-all text-center shadow-lg shadow-purple-500/25"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
