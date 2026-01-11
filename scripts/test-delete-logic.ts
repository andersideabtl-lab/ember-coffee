/**
 * 삭제 로직 자동 검증 테스트 스크립트
 * 실행: npx tsx scripts/test-delete-logic.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

async function testDeleteLogic() {
  // .env.local 파일 로드
  dotenv.config({ path: resolve(process.cwd(), '.env.local') });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('='.repeat(60));
  console.log('삭제 로직 자동 검증 테스트 시작');
  console.log('='.repeat(60));

  // 1. 환경 변수 확인
  console.log('\n[1단계] 환경 변수 확인');
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 오류: 환경 변수가 설정되지 않았습니다.');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음');
    process.exit(1);
  }
  console.log('   ✅ 환경 변수 확인 완료');

  // 2. Supabase 클라이언트 생성
  console.log('\n[2단계] Supabase 클라이언트 생성');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('   ✅ 클라이언트 생성 완료');

  let testContactId: string | null = null;

  try {
    // 3. 테스트 데이터 삽입
    console.log('\n[3단계] 테스트 삭제용 데이터 삽입');
    const testData = {
      name: `테스트 삭제용_${Date.now()}`,
      email: `test_delete_${Date.now()}@example.com`,
      phone: '010-9999-9999',
      message: '이 데이터는 삭제 로직 테스트용입니다. 자동으로 삭제됩니다.',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ 데이터 삽입 실패:', insertError.message);
      console.error('   오류 코드:', insertError.code);
      process.exit(1);
    }

    if (!insertData || !insertData.id) {
      console.error('   ❌ 삽입된 데이터에 ID가 없습니다.');
      process.exit(1);
    }

    testContactId = insertData.id;
    console.log('   ✅ 테스트 데이터 삽입 성공');
    console.log('   - ID:', testContactId);
    console.log('   - 이름:', insertData.name);
    console.log('   - 이메일:', insertData.email);

    // 4. 삽입된 데이터 확인
    console.log('\n[4단계] 삽입된 데이터 존재 확인');
    const { data: verifyBefore, error: verifyBeforeError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', testContactId)
      .single();

    if (verifyBeforeError || !verifyBefore) {
      console.error('   ❌ 삽입된 데이터를 찾을 수 없습니다.');
      console.error('   오류:', verifyBeforeError?.message);
      process.exit(1);
    }

    console.log('   ✅ 삽입된 데이터 확인 완료');
    console.log('   - 데이터 존재: 예');

    // 5. 삭제 로직 실행 (deleteContact 함수 로직 재현)
    console.log('\n[5단계] 삭제 로직 실행');
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', testContactId);

    if (deleteError) {
      console.error('   ❌ 삭제 실패:', deleteError.message);
      console.error('   오류 코드:', deleteError.code);
      process.exit(1);
    }

    console.log('   ✅ 삭제 명령 실행 완료');

    // 6. 삭제 확인 (데이터가 정말 사라졌는지 확인)
    console.log('\n[6단계] 삭제 확인 (데이터 존재 여부 재확인)');
    const { data: verifyAfter, error: verifyAfterError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', testContactId)
      .single();

    if (verifyAfterError) {
      // 데이터가 없으면 Supabase는 에러를 반환하므로, 이것이 정상입니다
      if (verifyAfterError.code === 'PGRST116' || verifyAfterError.message.includes('No rows')) {
        console.log('   ✅ 삭제 확인 완료: 데이터가 정상적으로 삭제되었습니다');
        console.log('   - 데이터 존재: 아니오 (삭제됨)');
      } else {
        console.error('   ❌ 예상치 못한 오류:', verifyAfterError.message);
        process.exit(1);
      }
    } else if (verifyAfter) {
      console.error('   ❌ 삭제 실패: 데이터가 여전히 존재합니다!');
      console.error('   - ID:', verifyAfter.id);
      process.exit(1);
    }

    // 7. 최종 검증: 전체 목록에서도 확인
    console.log('\n[7단계] 최종 검증 (전체 목록에서 확인)');
    const { data: allContacts, error: allContactsError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', testContactId);

    if (allContactsError) {
      console.error('   ⚠️  목록 조회 오류:', allContactsError.message);
    } else if (allContacts && allContacts.length > 0) {
      console.error('   ❌ 최종 검증 실패: 삭제된 데이터가 목록에 여전히 존재합니다!');
      process.exit(1);
    } else {
      console.log('   ✅ 최종 검증 완료: 삭제된 데이터가 목록에 없습니다');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 삭제 로직 검증 완료');
    console.log('='.repeat(60));
    console.log('\n모든 단계가 성공적으로 완료되었습니다:');
    console.log('  ✓ 테스트 데이터 삽입');
    console.log('  ✓ 삽입된 데이터 확인');
    console.log('  ✓ 삭제 로직 실행');
    console.log('  ✓ 삭제 확인');
    console.log('  ✓ 최종 검증');
    console.log('\n삭제 로직이 정상적으로 작동합니다! 🎉\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 예상치 못한 오류 발생:', error);
    
    // 정리: 테스트 데이터가 남아있으면 삭제 시도
    if (testContactId) {
      console.log('\n정리 중: 테스트 데이터 삭제 시도...');
      try {
        await supabase.from('contacts').delete().eq('id', testContactId);
        console.log('   ✅ 정리 완료');
      } catch (cleanupError) {
        console.error('   ⚠️  정리 실패 (수동 삭제 필요):', cleanupError);
      }
    }
    
    process.exit(1);
  }
}

// 스크립트 실행
testDeleteLogic().catch((error) => {
  console.error('치명적 오류:', error);
  process.exit(1);
});
