"use client";

import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-amber-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 브랜드 정보 */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Ember Coffee</h3>
            <p className="text-amber-100 mb-4">
              프리미엄 원두로 내리는 특별한 커피 경험을 제공합니다.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-100 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-100 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-100 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="mailto:info@embercoffee.com"
                className="text-amber-100 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-xl font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#home"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="#menu"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  메뉴
                </Link>
              </li>
              <li>
                <Link
                  href="#location"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  위치
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  문의
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 정보 */}
          <div>
            <h4 className="text-xl font-semibold mb-4">연락처</h4>
            <ul className="space-y-2 text-amber-100">
              <li>서울특별시 강남구 테헤란로 123</li>
              <li>엠버빌딩 1층</li>
              <li>02-1234-5678</li>
              <li>info@embercoffee.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-amber-800 pt-8 text-center text-amber-200">
          <p>&copy; {new Date().getFullYear()} Ember Coffee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
