"use client";

import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920')",
        }}
      />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6">
          Ember Coffee
        </h1>
        <p className="text-xl md:text-2xl text-amber-800 mb-8 max-w-2xl mx-auto">
          프리미엄 원두로 내리는 특별한 커피 경험
        </p>
        <Button
          size="lg"
          className="bg-amber-700 hover:bg-amber-800 text-white"
          onClick={() => {
            document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          메뉴 보기
        </Button>
      </div>
    </section>
  );
}
