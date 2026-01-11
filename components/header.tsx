"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-900">
            Ember Coffee
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="#home"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              홈
            </Link>
            <Link
              href="#menu"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              메뉴
            </Link>
            <Link
              href="#location"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              위치
            </Link>
            <Link
              href="#contact"
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              문의
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 mt-4">
              <Link
                href="#home"
                className="text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="#menu"
                className="text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                메뉴
              </Link>
              <Link
                href="#location"
                className="text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                위치
              </Link>
              <Link
                href="#contact"
                className="text-gray-700 hover:text-amber-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                문의
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
