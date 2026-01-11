"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { submitContact } from "@/app/actions/contact";
import { X, Image as ImageIcon } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 실시간 검증 함수
  const validateField = (name: string, value: string) => {
    const trimmedValue = value.trim();
    
    switch (name) {
      case 'name':
        if (!trimmedValue) {
          setErrors((prev) => ({ ...prev, name: '이름을 입력해 주세요.' }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
        }
        break;
      
      case 'email':
        if (!trimmedValue) {
          setErrors((prev) => ({ ...prev, email: '올바른 이메일 주소를 입력해 주세요.' }));
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmedValue)) {
            setErrors((prev) => ({ ...prev, email: '올바른 이메일 주소를 입력해 주세요.' }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        }
        break;
      
      case 'phone':
        if (!trimmedValue) {
          setErrors((prev) => ({ ...prev, phone: '연락처를 입력해 주세요.' }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.phone;
            return newErrors;
          });
        }
        break;
      
      case 'message':
        if (!trimmedValue) {
          setErrors((prev) => ({ ...prev, message: '문의 내용을 입력해 주세요.' }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.message;
            return newErrors;
          });
        }
        break;
      
      default:
        break;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 실시간 검증
    if (name === 'name' || name === 'email' || name === 'phone' || name === 'message') {
      validateField(name, value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      e.target.value = '';
      return;
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('파일 크기는 5MB 이하여야 합니다.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);

    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // 파일 입력 필드 초기화
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 클라이언트 사이드 검증
    const trimmedName = formData.name?.trim() || '';
    const trimmedEmail = formData.email?.trim() || '';
    const trimmedPhone = formData.phone?.trim() || '';
    const trimmedMessage = formData.message?.trim() || '';
    
    const clientErrors: typeof errors = {};
    
    if (!trimmedName) {
      clientErrors.name = '이름을 입력해 주세요.';
    }
    
    if (!trimmedEmail) {
      clientErrors.email = '올바른 이메일 주소를 입력해 주세요.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        clientErrors.email = '올바른 이메일 주소를 입력해 주세요.';
      }
    }
    
    if (!trimmedPhone) {
      clientErrors.phone = '연락처를 입력해 주세요.';
    }
    
    if (!trimmedMessage) {
      clientErrors.message = '문의 내용을 입력해 주세요.';
    }
    
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }
    
    startTransition(async () => {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('phone', formData.phone || '');
      formDataToSubmit.append('message', formData.message);
      
      if (selectedFile) {
        formDataToSubmit.append('attachment', selectedFile);
      }

      const result = await submitContact(formDataToSubmit);
      
      if (result.success) {
        toast.success("문의가 성공적으로 접수되었습니다!");
        // 폼 초기화
        setFormData({ name: "", email: "", phone: "", message: "" });
        setErrors({});
        setSelectedFile(null);
        setPreviewUrl(null);
        // HTML 폼 리셋
        formRef.current?.reset();
      } else {
        // 서버에서 반환된 필드별 에러 표시
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        } else {
          toast.error(result.error || "문의 접수 중 오류가 발생했습니다.");
        }
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
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름을 입력해주세요"
                    className={errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
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
                    className={errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-red-600" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">메시지</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="문의 내용을 입력해주세요"
                    rows={6}
                    className={errors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-sm text-red-600" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">파일 첨부 (이미지)</Label>
                  <div className="space-y-2">
                    <Input
                      id="attachment"
                      name="attachment"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {previewUrl && (
                      <div className="relative inline-block mt-2">
                        <div className="relative group">
                          <img
                            src={previewUrl}
                            alt="미리보기"
                            className="h-32 w-auto rounded-md border border-gray-300 object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="파일 제거"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {selectedFile && (
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    이미지 파일만 업로드 가능합니다. (최대 5MB)
                  </p>
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
