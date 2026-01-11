/**
 * Supabase 연결 테스트 스크립트
 * 실행: npx tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

async function testSupabase() {
  // .env.local 파일 로드
  dotenv.config({ path: resolve(process.cwd(), '.env.local') });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('='.repeat(60));
  console.log('Supabase 연결 테스트 시작');
  console.log('='.repeat(60));

  // 1. 환경 변수 확인
  console.log('\n[1단계] 환경 변수 확인');
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 오류: 환경 변수가 설정되지 않았습니다.');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음');
    process.exit(1);
  }
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음');

  // 2. Supabase 클라이언트 생성
  console.log('\n[2단계] Supabase 클라이언트 생성');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('   ✅ 클라이언트 생성 완료');

  // 3. 연결 테스트 (contacts 테이블 조회)
  console.log('\n[3단계] 데이터베이스 연결 테스트');
  try {
    const { data: testData, error: testError } = await supabase
      .from('contacts')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('   ❌ 연결 오류:', testError.message);
      console.error('   오류 코드:', testError.code);
      console.error('   오류 상세:', testError);
      
      if (testError.code === 'PGRST116' || testError.message.includes('relation "contacts" does not exist')) {
        console.error('\n   ⚠️  contacts 테이블이 존재하지 않습니다.');
        console.error('   → Supabase Dashboard > SQL Editor에서 supabase_schema.sql 파일의 쿼리를 실행해주세요.');
      } else if (testError.code === '42501' || testError.message.includes('permission')) {
        console.error('\n   ⚠️  권한 오류가 발생했습니다.');
        console.error('   → RLS 정책을 확인하거나, 테이블 접근 권한을 확인해주세요.');
      }
      process.exit(1);
    }
    console.log('   ✅ 데이터베이스 연결 성공');
  } catch (error) {
    console.error('   ❌ 예상치 못한 오류:', error);
    process.exit(1);
  }

  // 4. 테스트 데이터 삽입
  console.log('\n[4단계] 테스트 데이터 삽입');
  const testContactData = {
    name: '테스트 사용자',
    email: `test_${Date.now()}@example.com`,
    phone: '010-1234-5678',
    message: 'Supabase 연동 테스트 문의입니다.',
  };

  try {
    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert([testContactData])
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ 데이터 삽입 실패:', insertError.message);
      console.error('   오류 코드:', insertError.code);
      console.error('   오류 상세:', insertError);
      
      if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
        console.error('\n   ⚠️  중복 데이터 오류 (이메일 제약조건 등)');
      } else if (insertError.code === '23503' || insertError.message.includes('foreign key')) {
        console.error('\n   ⚠️  외래 키 제약조건 오류');
      }
      process.exit(1);
    }

    console.log('   ✅ 데이터 삽입 성공!');
    console.log('   삽입된 데이터:');
    console.log('   - ID:', insertData.id);
    console.log('   - 이름:', insertData.name);
    console.log('   - 이메일:', insertData.email);
    console.log('   - 연락처:', insertData.phone);
    console.log('   - 메시지:', insertData.message);
    console.log('   - 생성일:', insertData.created_at);

    // 5. 삽입된 데이터 확인
    console.log('\n[5단계] 삽입된 데이터 조회 확인');
    const { data: verifyData, error: verifyError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', insertData.id)
      .single();

    if (verifyError) {
      console.error('   ⚠️  데이터 조회 오류:', verifyError.message);
    } else {
      console.log('   ✅ 데이터 조회 성공');
      console.log('   확인된 레코드 수: 1');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 완료!');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('   ❌ 예상치 못한 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
testSupabase().catch((error) => {
  console.error('치명적 오류:', error);
  process.exit(1);
});

