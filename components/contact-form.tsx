"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitContact } from "@/app/actions/contact";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await submitContact(formData);
      
      if (result.success) {
        toast.success("문의가 성공적으로 접수되었습니다!");
        // 폼 초기화
        setFormData({ name: "", email: "", phone: "", message: "" });
        // HTML 폼 리셋
        formRef.current?.reset();
      } else {
        toast.error(result.error || "문의 접수 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-amber-900 mb-4">
          문의하기
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          궁금한 사항이나 건의사항이 있으시면 언제든지 연락주세요
        </p>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>문의 양식</CardTitle>
              <CardDescription>
                아래 양식을 작성해주시면 빠른 시일 내에 답변드리겠습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름을 입력해주세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">메시지</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="문의 내용을 입력해주세요"
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={isPending}
                  aria-disabled={isPending}
                >
                  {isPending ? "전송 중..." : "문의하기"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
