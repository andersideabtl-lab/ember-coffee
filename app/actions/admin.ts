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

export async function updateContactStatus(contactId: string, status: 'pending' | 'completed'): Promise<{
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
      .update({ status })
      .eq('id', contactId);

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase update error:', error);
      }
      return {
        success: false,
        error: '상태 업데이트 중 오류가 발생했습니다.',
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

export interface ContactStats {
  total: number;
  today: number;
  pending: number;
  completed: number;
}

export async function getContactStats(): Promise<{
  success: boolean;
  data?: ContactStats;
  error?: string;
}> {
  try {
    // 전체 문의 수
    const { count: totalCount, error: totalError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // 오늘의 문의 수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();

    const { count: todayCount, error: todayError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    if (todayError) throw todayError;

    // 미처리 문의 수
    const { count: pendingCount, error: pendingError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // 처리 완료 문의 수
    const { count: completedCount, error: completedError } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (completedError) throw completedError;

    return {
      success: true,
      data: {
        total: totalCount || 0,
        today: todayCount || 0,
        pending: pendingCount || 0,
        completed: completedCount || 0,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stats error:', error);
    }
    return {
      success: false,
      error: '통계를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

export interface DailyContact {
  date: string;
  count: number;
}

export async function getDailyContacts(days: number = 7): Promise<{
  success: boolean;
  data?: DailyContact[];
  error?: string;
}> {
  try {
    // 최근 N일간의 날짜 범위 계산
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('contacts')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // 날짜별로 그룹화
    const dailyMap = new Map<string, number>();
    
    // 날짜 범위 초기화
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dailyMap.set(dateKey, 0);
    }

    // 실제 데이터 카운트
    data?.forEach((contact) => {
      if (contact.created_at) {
        const dateKey = new Date(contact.created_at).toISOString().split('T')[0];
        const currentCount = dailyMap.get(dateKey) || 0;
        dailyMap.set(dateKey, currentCount + 1);
      }
    });

    // 배열로 변환 및 정렬
    const dailyData: DailyContact[] = Array.from(dailyMap.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      data: dailyData,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Daily contacts error:', error);
    }
    return {
      success: false,
      error: '일별 통계를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

