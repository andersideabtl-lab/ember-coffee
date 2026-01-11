/**
 * 전체 파이프라인 자동 검증 테스트 스크립트
 * 
 * 이 스크립트는 다음 전체 파이프라인을 검증합니다:
 * 1. 가상 파일 생성
 * 2. Supabase Storage 업로드
 * 3. DB 저장 (attachment_url 포함)
 * 4. Discord 알림 전송
 * 
 * 실행: npx tsx scripts/test-full-pipeline.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { sendDiscordNotification, createContactNotificationPayload } from '../lib/discord';

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

// 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

if (!discordWebhookUrl) {
  console.error('❌ Discord Webhook URL이 설정되지 않았습니다.');
  console.error('   DISCORD_WEBHOOK_URL:', discordWebhookUrl ? '✅' : '❌');
  console.error('   💡 .env.local 파일에 DISCORD_WEBHOOK_URL을 추가하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 가상의 PNG 이미지 파일 생성 (더미 버퍼)
 */
function createDummyImageBuffer(): Buffer {
  // 작은 PNG 이미지의 바이너리 데이터 (1x1 픽셀 투명 PNG)
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

async function testFullPipeline() {
  console.log('='.repeat(60));
  console.log('🔍 전체 파이프라인 자동 검증 시작');
  console.log('='.repeat(60));
  console.log('\n검증 항목:');
  console.log('  [ ] 스토리지 업로드');
  console.log('  [ ] DB 저장 및 attachment_url 기록');
  console.log('  [ ] Discord 알림 전송 (200 OK)');
  console.log('\n' + '-'.repeat(60) + '\n');

  let uploadedFilePath: string | null = null;
  let insertedContactId: string | null = null;
  let attachmentUrl: string | null = null;

  try {
    // ============================================================
    // 1단계: 가상 파일 생성
    // ============================================================
    console.log('1️⃣ [가상 파일 생성] 가상의 이미지 파일 생성 중...');
    const dummyImageBuffer = createDummyImageBuffer();
    console.log(`   ✅ 더미 PNG 이미지 생성 완료 (${dummyImageBuffer.length} bytes)\n`);

    // ============================================================
    // 2단계: Supabase Storage 업로드
    // ============================================================
    console.log('2️⃣ [스토리지 업로드] Supabase Storage에 파일 업로드 중...');
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `pipeline-test-${timestamp}-${randomString}.png`;
    uploadedFilePath = `contacts/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contact-attachments')
      .upload(uploadedFilePath, dummyImageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      console.error('   ❌ 파일 업로드 실패:', uploadError.message);
      
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        console.error('\n   💡 해결 방법:');
        console.error('   Supabase Dashboard > Storage에서 "contact-attachments" 버킷을 생성하세요.');
        console.error('   - 버킷 이름: contact-attachments');
        console.error('   - Public bucket: Yes');
      }
      
      throw uploadError;
    }

    console.log(`   ✅ 파일 업로드 성공: ${uploadedFilePath}`);
    
    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('contact-attachments')
      .getPublicUrl(uploadedFilePath);

    attachmentUrl = urlData.publicUrl;
    console.log(`   ✅ 공개 URL 생성: ${attachmentUrl}\n`);

    // ============================================================
    // 3단계: DB 저장 (attachment_url 포함)
    // ============================================================
    console.log('3️⃣ [DB 저장] contacts 테이블에 데이터 삽입 중...');
    const testContactData = {
      name: `파이프라인 테스트 사용자 ${timestamp}`,
      email: `pipeline-test-${timestamp}@example.com`,
      phone: '010-9999-9999',
      message: '전체 파이프라인 검증 테스트 메시지입니다. 이 메시지는 자동화된 테스트에서 생성되었습니다.',
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

    insertedContactId = insertData.id;
    console.log(`   ✅ 데이터 삽입 성공 (ID: ${insertedContactId})`);
    console.log(`   ✅ attachment_url 저장 확인: ${insertData.attachment_url ? '✅ 있음' : '❌ 없음'}\n`);

    // DB 조회하여 attachment_url 확인
    const { data: verifyData, error: verifyError } = await supabase
      .from('contacts')
      .select('id, name, email, attachment_url')
      .eq('id', insertedContactId)
      .single();

    if (verifyError || !verifyData || !verifyData.attachment_url) {
      console.error('   ❌ DB 검증 실패: attachment_url이 저장되지 않았습니다.');
      throw new Error('attachment_url 검증 실패');
    }

    if (verifyData.attachment_url !== attachmentUrl) {
      console.error('   ❌ DB 검증 실패: 저장된 attachment_url이 업로드 URL과 일치하지 않습니다.');
      throw new Error('attachment_url 일치 검증 실패');
    }

    console.log('   ✅ DB 저장 및 attachment_url 기록 검증 완료\n');

    // ============================================================
    // 4단계: Discord 알림 전송
    // ============================================================
    console.log('4️⃣ [Discord 알림] Discord Webhook으로 알림 전송 중...');
    
    const discordPayload = createContactNotificationPayload({
      name: testContactData.name,
      email: testContactData.email,
      phone: testContactData.phone,
      message: testContactData.message,
      attachmentUrl: attachmentUrl,
      createdAt: insertData.created_at,
    });

    // Discord Webhook URL을 환경 변수에서 직접 사용
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Discord 알림 전송 실패: ${response.status} ${response.statusText}`);
      console.error(`   응답 내용: ${errorText}`);
      throw new Error(`Discord 알림 전송 실패: ${response.status}`);
    }

    const responseData = await response.json().catch(() => null);
    console.log(`   ✅ Discord API 호출 성공: ${response.status} ${response.statusText}`);
    if (responseData) {
      console.log(`   ✅ Discord 응답: ${JSON.stringify(responseData)}\n`);
    } else {
      console.log('   ✅ Discord 알림 전송 완료\n');
    }

    // ============================================================
    // 최종 검증 결과
    // ============================================================
    console.log('='.repeat(60));
    console.log('✅ 종합 파이프라인 검증 완료');
    console.log('='.repeat(60));
    console.log('\n체크리스트:');
    console.log('  [✅] 스토리지 업로드 성공');
    console.log('  [✅] DB 저장 및 attachment_url 기록 성공');
    console.log('  [✅] Discord API 호출 성공 (200 OK)');
    console.log('\n검증 완료 항목:');
    console.log('  ✅ 가상 파일 생성');
    console.log('  ✅ Supabase Storage 파일 업로드');
    console.log('  ✅ 공개 URL 생성');
    console.log('  ✅ contacts 테이블에 attachment_url 저장');
    console.log('  ✅ DB 조회 및 attachment_url 검증');
    console.log('  ✅ Discord Webhook 알림 전송');
    console.log('\n' + '='.repeat(60));
    console.log('🎉 모든 백엔드 파이프라인이 정상적으로 작동합니다!');
    console.log('='.repeat(60));
    console.log('\n📱 중요: Discord 채널에서 테스트 알림 메시지가 도착했는지 확인해주세요!');
    console.log('   - 메시지 제목: "🔔 새 문의 접수!"');
    console.log('   - 이름: 파이프라인 테스트 사용자 ...');
    console.log('   - 첨부파일 링크 포함 여부 확인');
    console.log('\n');

    // 테스트 데이터 정리 (선택사항)
    console.log('🧹 테스트 데이터 정리 중...');
    try {
      if (uploadedFilePath) {
        await supabase.storage
          .from('contact-attachments')
          .remove([uploadedFilePath]);
      }

      if (insertedContactId) {
        await supabase
          .from('contacts')
          .delete()
          .eq('id', insertedContactId);
      }

      console.log('   ✅ 테스트 데이터 정리 완료\n');
    } catch (cleanupError) {
      console.warn('   ⚠️ 테스트 데이터 정리 중 오류 발생 (무시 가능)');
      console.warn(`   💡 수동 삭제 필요 - Contact ID: ${insertedContactId}, File: ${uploadedFilePath}\n`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ 종합 파이프라인 검증 실패');
    console.error('='.repeat(60));
    
    if (error instanceof Error) {
      console.error('\n에러 메시지:', error.message);
      if (error.stack) {
        console.error('\n에러 스택:', error.stack);
      }
    } else {
      console.error('\n에러 내용:', error);
    }

    // 정리 작업
    console.log('\n🧹 정리 작업 시도 중...');
    try {
      if (uploadedFilePath) {
        await supabase.storage
          .from('contact-attachments')
          .remove([uploadedFilePath])
          .catch(() => {});
      }

      if (insertedContactId) {
        await supabase
          .from('contacts')
          .delete()
          .eq('id', insertedContactId)
          .catch(() => {});
      }
      
      console.log('   ✅ 정리 작업 완료');
    } catch (cleanupError) {
      console.error('   ⚠️ 정리 작업 실패');
    }

    process.exit(1);
  }
}

// 스크립트 실행
testFullPipeline().catch((error) => {
  console.error('치명적 오류:', error);
  process.exit(1);
});
