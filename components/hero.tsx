"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const handleMenuClick = () => {
    const menuElement = document.getElementById("menu");
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100"
      aria-label="메인 히어로 섹션"
    >
      <div className="absolute inset-0 opacity-20">
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
          aria-hidden="true"
        />
      </div>
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6">
          Ember Coffee
        </h1>
        <p className="text-xl md:text-2xl text-amber-950 mb-8 max-w-2xl mx-auto">
          프리미엄 원두로 내리는 특별한 커피 경험
        </p>
        <Button
          size="lg"
          className="bg-amber-700 hover:bg-amber-800 text-white focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
          onClick={handleMenuClick}
          aria-label="메뉴 섹션으로 이동"
        >
          메뉴 보기
        </Button>
      </div>
    </section>
  );
}
