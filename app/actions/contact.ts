'use server';

import { supabase, type Contact } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface SubmitContactResult {
  success: boolean;
  data?: Contact;
  message?: string;
  error?: string;
}

export async function submitContact(formData: ContactFormData): Promise<SubmitContactResult> {
  try {
    // 입력 데이터 검증 (trim 후 빈 문자열도 체크)
    const trimmedName = formData.name?.trim() || '';
    const trimmedEmail = formData.email?.trim() || '';
    const trimmedMessage = formData.message?.trim() || '';

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return {
        success: false,
        error: '이름, 이메일, 메시지는 필수 항목입니다.',
      };
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return {
        success: false,
        error: '올바른 이메일 형식을 입력해주세요.',
      };
    }

    // Supabase에 데이터 삽입
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: trimmedName,
          email: trimmedEmail.toLowerCase(),
          phone: formData.phone?.trim() || null,
          message: trimmedMessage,
        },
      ])
      .select()
      .single();

    if (error) {
      // 개발 환경에서만 에러 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase error:', error);
      }
      return {
        success: false,
        error: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    // 캐시 재검증 (필요한 경우)
    revalidatePath('/');

    return {
      success: true,
      data: data as Contact,
      message: '문의가 성공적으로 접수되었습니다.',
    };
  } catch (error) {
    // 개발 환경에서만 에러 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
