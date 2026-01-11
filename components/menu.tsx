"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const menuItems = [
  {
    id: 1,
    name: "에스프레소",
    description: "깊고 진한 에스프레소의 원초적인 맛",
    price: "4,000원",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80",
  },
  {
    id: 2,
    name: "아메리카노",
    description: "부드럽고 깔끔한 클래식 아메리카노",
    price: "4,500원",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  },
  {
    id: 3,
    name: "카페라떼",
    description: "부드러운 우유와 에스프레소의 조화",
    price: "5,000원",
    image: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800&q=80",
  },
  {
    id: 4,
    name: "카푸치노",
    description: "우아한 우유 거품이 올라간 카푸치노",
    price: "5,000원",
    image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
  },
  {
    id: 5,
    name: "바닐라라떼",
    description: "달콤한 바닐라와 라떼의 만남",
    price: "5,500원",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "카라멜마키아토",
    description: "달콤한 카라멜과 에스프레소의 환상적 조합",
    price: "5,500원",
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80&auto=format&fit=crop",
  },
];

export default function Menu() {
  return (
    <section id="menu" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-amber-900 mb-4">
          메뉴
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          정성스럽게 준비한 다양한 커피 메뉴를 만나보세요
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-amber-900">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-700">{item.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
