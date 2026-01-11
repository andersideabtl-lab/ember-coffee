'use server';

import { supabase, type Contact } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { sendDiscordNotification, createContactNotificationPayload } from '@/lib/discord';
import { sendAdminEmail } from '@/lib/email';

export interface SubmitContactResult {
  success: boolean;
  data?: Contact;
  message?: string;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
}

export async function submitContact(formData: FormData): Promise<SubmitContactResult> {
  try {
    // FormData에서 값 추출
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const attachment = formData.get('attachment') as File | null;

    // 입력 데이터 검증 (trim 후 빈 문자열도 체크)
    const trimmedName = name?.trim() || '';
    const trimmedEmail = email?.trim() || '';
    const trimmedPhone = phone?.trim() || '';
    const trimmedMessage = message?.trim() || '';

    // 필드별 에러 메시지 수집
    const fieldErrors: {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    } = {};

    // 이름 검증
    if (!trimmedName) {
      fieldErrors.name = '이름을 입력해 주세요.';
    }

    // 이메일 검증
    if (!trimmedEmail) {
      fieldErrors.email = '올바른 이메일 주소를 입력해 주세요.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        fieldErrors.email = '올바른 이메일 주소를 입력해 주세요.';
      }
    }

    // 연락처 검증
    if (!trimmedPhone) {
      fieldErrors.phone = '연락처를 입력해 주세요.';
    }

    // 메시지 검증
    if (!trimmedMessage) {
      fieldErrors.message = '문의 내용을 입력해 주세요.';
    }

    // 필드 에러가 있으면 반환
    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: '입력한 내용을 확인해 주세요.',
        fieldErrors,
      };
    }

    // 파일 업로드 처리 (이미지가 있는 경우)
    let attachmentUrl: string | null = null;

    if (attachment && attachment.size > 0) {
      try {
        // 파일 확장자 추출
        const fileExt = attachment.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `contacts/${fileName}`;

        // ArrayBuffer로 변환
        const arrayBuffer = await attachment.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('contact-attachments')
          .upload(filePath, fileBuffer, {
            contentType: attachment.type,
            upsert: false,
          });

        if (uploadError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Storage upload error:', uploadError);
          }
          return {
            success: false,
            error: '파일 업로드 중 오류가 발생했습니다.',
          };
        }

        // 공개 URL 가져오기
        const { data: urlData } = supabase.storage
          .from('contact-attachments')
          .getPublicUrl(filePath);

        attachmentUrl = urlData.publicUrl;
      } catch (uploadError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('File upload error:', uploadError);
        }
        return {
          success: false,
          error: '파일 업로드 중 오류가 발생했습니다.',
        };
      }
    }

    // Supabase에 데이터 삽입
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: trimmedName,
          email: trimmedEmail.toLowerCase(),
          phone: trimmedPhone || null,
          message: trimmedMessage,
          attachment_url: attachmentUrl,
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

    // 멀티 알림 전송 (Discord + Email)
    // 각 알림은 독립적으로 실행되며, 한쪽이 실패해도 다른 쪽은 계속 진행됩니다
    
    // Discord 알림 전송
    try {
      const discordPayload = createContactNotificationPayload({
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone || null,
        message: trimmedMessage,
        attachmentUrl: attachmentUrl,
        createdAt: data.created_at,
      });

      await sendDiscordNotification(discordPayload);
    } catch (discordError) {
      // Discord 알림 실패는 로그만 남기고 문의 접수 성공으로 처리
      if (process.env.NODE_ENV === 'development') {
        console.error('Discord 알림 전송 실패 (문의는 정상 저장됨):', discordError);
      }
    }

    // 이메일 알림 전송
    try {
      await sendAdminEmail({
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        phone: trimmedPhone || null,
        message: trimmedMessage,
        attachmentUrl: attachmentUrl,
        createdAt: data.created_at,
      });
    } catch (emailError) {
      // 이메일 알림 실패는 로그만 남기고 문의 접수 성공으로 처리
      if (process.env.NODE_ENV === 'development') {
        console.error('이메일 알림 전송 실패 (문의는 정상 저장됨):', emailError);
      }
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
