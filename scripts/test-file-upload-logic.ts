/**
 * 파일 업로드 및 DB 연동 로직 검증 스크립트
 * 
 * 이 스크립트는 다음을 검증합니다:
 * 1. Supabase Storage에 파일 업로드
 * 2. 업로드된 파일의 공개 URL 생성
 * 3. contacts 테이블에 attachment_url과 함께 데이터 삽입
 * 4. DB 조회하여 attachment_url 확인
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 가상의 PNG 이미지 파일 생성 (더미 버퍼)
 */
function createDummyImageBuffer(): Buffer {
  // 작은 PNG 이미지의 바이너리 데이터 (1x1 픽셀 투명 PNG)
  // PNG 시그니처 + IHDR + IDAT + IEND
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG 시그니처
    0x00, 0x00, 0x00, 0x0d, // IHDR 청크 크기
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
    0x1f, 0x15, 0xc4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0a, // IDAT 청크 크기
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // 압축된 데이터
    0x0d, 0x0a, 0x2d, 0xb4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND 청크 크기
    0x49, 0x45, 0x4e, 0x44, // IEND
    0xae, 0x42, 0x60, 0x82, // CRC
  ]);

  return pngBuffer;
}

async function testFileUploadAndDBIntegration() {
  console.log('🔍 파일 업로드 및 DB 연동 로직 검증 시작...\n');

  try {
    // 1단계: 가상의 이미지 파일 생성
    console.log('1️⃣ 가상의 이미지 파일 생성 중...');
    const dummyImageBuffer = createDummyImageBuffer();
    console.log(`   ✅ 더미 PNG 이미지 생성 완료 (${dummyImageBuffer.length} bytes)\n`);

    // 2단계: Supabase Storage에 업로드
    console.log('2️⃣ Supabase Storage에 파일 업로드 중...');
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `test-${timestamp}-${randomString}.png`;
    const filePath = `contacts/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contact-attachments')
      .upload(filePath, dummyImageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('   ❌ 파일 업로드 실패:', uploadError.message);
      
      // 버킷이 없는 경우 안내
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        console.error('\n   💡 해결 방법:');
        console.error('   Supabase Dashboard > Storage에서 "contact-attachments" 버킷을 생성하세요.');
        console.error('   - 버킷 이름: contact-attachments');
        console.error('   - Public bucket: Yes');
      }
      
      throw uploadError;
    }

    console.log(`   ✅ 파일 업로드 성공: ${filePath}\n`);

    // 3단계: 공개 URL 가져오기
    console.log('3️⃣ 공개 URL 생성 중...');
    const { data: urlData } = supabase.storage
      .from('contact-attachments')
      .getPublicUrl(filePath);

    const attachmentUrl = urlData.publicUrl;
    console.log(`   ✅ 공개 URL: ${attachmentUrl}\n`);

    // 4단계: contacts 테이블에 데이터 삽입
    console.log('4️⃣ contacts 테이블에 데이터 삽입 중...');
    const testContactData = {
      name: `테스트 사용자 ${timestamp}`,
      email: `test-${timestamp}@example.com`,
      phone: '010-1234-5678',
      message: '파일 업로드 및 DB 연동 검증 테스트 메시지입니다.',
      attachment_url: attachmentUrl,
    };

    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert([testContactData])
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ 데이터 삽입 실패:', insertError.message);
      throw insertError;
    }

    console.log(`   ✅ 데이터 삽입 성공 (ID: ${insertData.id})\n`);

    // 5단계: DB 조회하여 attachment_url 확인
    console.log('5️⃣ DB 조회하여 attachment_url 확인 중...');
    const { data: fetchedData, error: fetchError } = await supabase
      .from('contacts')
      .select('id, name, email, attachment_url')
      .eq('id', insertData.id)
      .single();

    if (fetchError) {
      console.error('   ❌ 데이터 조회 실패:', fetchError.message);
      throw fetchError;
    }

    console.log('   ✅ 데이터 조회 성공\n');
    console.log('   📋 조회 결과:');
    console.log(`      - ID: ${fetchedData.id}`);
    console.log(`      - 이름: ${fetchedData.name}`);
    console.log(`      - 이메일: ${fetchedData.email}`);
    console.log(`      - 첨부파일 URL: ${fetchedData.attachment_url}\n`);

    // 6단계: attachment_url 형식 검증
    console.log('6️⃣ attachment_url 형식 검증 중...');
    if (!fetchedData.attachment_url) {
      throw new Error('attachment_url이 null입니다.');
    }

    if (typeof fetchedData.attachment_url !== 'string') {
      throw new Error('attachment_url이 문자열이 아닙니다.');
    }

    if (!fetchedData.attachment_url.startsWith('http')) {
      throw new Error('attachment_url이 올바른 URL 형식이 아닙니다.');
    }

    if (fetchedData.attachment_url !== attachmentUrl) {
      throw new Error('저장된 attachment_url이 업로드된 파일의 URL과 일치하지 않습니다.');
    }

    console.log('   ✅ attachment_url 형식 검증 통과\n');

    // 7단계: 테스트 데이터 정리 (선택사항)
    console.log('7️⃣ 테스트 데이터 정리 중...');
    try {
      // 업로드된 파일 삭제
      await supabase.storage
        .from('contact-attachments')
        .remove([filePath]);

      // DB에서 테스트 데이터 삭제
      await supabase
        .from('contacts')
        .delete()
        .eq('id', insertData.id);

      console.log('   ✅ 테스트 데이터 정리 완료\n');
    } catch (cleanupError) {
      console.warn('   ⚠️ 테스트 데이터 정리 중 오류 발생 (무시 가능):', cleanupError);
      console.log(`   💡 수동 삭제 필요 - Contact ID: ${insertData.id}, File: ${filePath}\n`);
    }

    // 최종 결과
    console.log('=' .repeat(60));
    console.log('✅ 파일 업로드 및 DB 연동 검증 완료!');
    console.log('=' .repeat(60));
    console.log('\n검증 완료 항목:');
    console.log('  ✅ Supabase Storage 파일 업로드');
    console.log('  ✅ 공개 URL 생성');
    console.log('  ✅ contacts 테이블에 attachment_url 저장');
    console.log('  ✅ DB 조회 및 attachment_url 형식 검증');
    console.log('\n모든 백엔드 파이프라인이 정상적으로 작동합니다! 🎉\n');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 파일 업로드 및 DB 연동 검증 실패');
    console.error('='.repeat(60));
    console.error('\n에러 내용:', error);
    
    if (error instanceof Error) {
      console.error('\n에러 메시지:', error.message);
      console.error('\n에러 스택:', error.stack);
    }
    
    process.exit(1);
  }
}

// 스크립트 실행
testFileUploadAndDBIntegration();
