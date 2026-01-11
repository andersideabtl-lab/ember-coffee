'use server';

import { supabase, type Contact } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getContacts(): Promise<{
  success: boolean;
  data?: Contact[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase error:', error);
      }
      return {
        success: false,
        error: '문의 목록을 불러오는 중 오류가 발생했습니다.',
      };
    }

    return {
      success: true,
      data: data as Contact[],
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    };
  }
}

export async function deleteContact(contactId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!contactId) {
      return {
        success: false,
        error: '문의 ID가 제공되지 않았습니다.',
      };
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase delete error:', error);
      }
      return {
        success: false,
        error: '문의 내역 삭제 중 오류가 발생했습니다.',
      };
    }

    // 캐시 재검증
    revalidatePath('/admin');

    return {
      success: true,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error);
    }
    return {
      success: false,
      error: '예상치 못한 오류가 발생했습니다.',
    };
  }
}
