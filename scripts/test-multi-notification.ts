/**
 * 멀티 알림 시스템 자동 검증 테스트 스크립트
 * 
 * 이 스크립트는 다음을 검증합니다:
 * 1. Discord 알림 전송
 * 2. Resend 이메일 알림 전송
 * 
 * 실행: npx tsx scripts/test-multi-notification.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { sendDiscordNotification, createContactNotificationPayload } from '../lib/discord';
import { sendAdminEmail } from '../lib/email';

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

async function testMultiNotification() {
  console.log('='.repeat(60));
  console.log('🔍 멀티 알림 시스템 자동 검증 시작');
  console.log('='.repeat(60));
  console.log('\n검증 항목:');
  console.log('  [ ] Discord 알림 전송');
  console.log('  [ ] Resend 이메일 알림 전송');
  console.log('\n' + '-'.repeat(60) + '\n');

  // 환경 변수 확인
  console.log('📋 환경 변수 확인 중...');
  const envCheck = {
    DISCORD_WEBHOOK_URL: discordWebhookUrl ? '✅' : '❌',
    RESEND_API_KEY: resendApiKey ? '✅' : '❌',
    ADMIN_EMAIL: adminEmail ? '✅' : '❌',
    RESEND_FROM_EMAIL: resendFromEmail ? '✅' : '⚠️ (선택사항)',
  };

  console.log('   DISCORD_WEBHOOK_URL:', envCheck.DISCORD_WEBHOOK_URL);
  console.log('   RESEND_API_KEY:', envCheck.RESEND_API_KEY);
  console.log('   ADMIN_EMAIL:', envCheck.ADMIN_EMAIL);
  console.log('   RESEND_FROM_EMAIL:', envCheck.RESEND_FROM_EMAIL);
  console.log();

  if (!discordWebhookUrl && !resendApiKey) {
    console.error('❌ Discord와 Resend 환경 변수가 모두 설정되지 않았습니다.');
    console.error('   최소한 하나의 알림 수단을 설정해야 합니다.');
    process.exit(1);
  }

  // 테스트 데이터 생성
  const timestamp = Date.now();
  const testData = {
    name: `멀티 알림 테스트 사용자 ${timestamp}`,
    email: `multi-test-${timestamp}@example.com`,
    phone: '010-8888-8888',
    message: '멀티 알림 시스템 검증 테스트 메시지입니다.\n\n이 메시지는 자동화된 테스트에서 생성되었으며, Discord와 이메일 알림이 모두 정상 작동하는지 확인하기 위한 것입니다.',
    attachmentUrl: 'https://example.com/test-image.png',
    createdAt: new Date().toISOString(),
  };

  let discordSuccess = false;
  let emailSuccess = false;
  let discordError: string | null = null;
  let emailError: string | null = null;

  // ============================================================
  // 1. Discord 알림 테스트
  // ============================================================
  if (discordWebhookUrl) {
    console.log('1️⃣ [Discord 알림] Discord Webhook으로 알림 전송 중...');
    
    try {
      const discordPayload = createContactNotificationPayload(testData);
      const result = await sendDiscordNotification(discordPayload);

      if (result.success) {
        console.log('   ✅ Discord 알림 전송 성공');
        discordSuccess = true;
      } else {
        console.error(`   ❌ Discord 알림 전송 실패: ${result.error}`);
        discordError = result.error || '알 수 없는 오류';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Discord 알림 전송 중 예외 발생: ${errorMessage}`);
      discordError = errorMessage;
    }
    console.log();
  } else {
    console.log('1️⃣ [Discord 알림] ⚠️ DISCORD_WEBHOOK_URL이 설정되지 않아 건너뜁니다.\n');
  }

  // ============================================================
  // 2. 이메일 알림 테스트
  // ============================================================
  if (resendApiKey && adminEmail) {
    console.log('2️⃣ [이메일 알림] Resend API로 이메일 전송 중...');
    
    try {
      const result = await sendAdminEmail(testData);

      if (result.success) {
        console.log(`   ✅ 이메일 알림 전송 성공`);
        if (result.messageId) {
          console.log(`   ✅ 이메일 ID: ${result.messageId}`);
        }
        emailSuccess = true;
      } else {
        console.error(`   ❌ 이메일 알림 전송 실패: ${result.error}`);
        emailError = result.error || '알 수 없는 오류';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ 이메일 알림 전송 중 예외 발생: ${errorMessage}`);
      emailError = errorMessage;
    }
    console.log();
  } else {
    console.log('2️⃣ [이메일 알림] ⚠️ RESEND_API_KEY 또는 ADMIN_EMAIL이 설정되지 않아 건너뜁니다.\n');
    if (!resendApiKey) {
      console.log('   💡 RESEND_API_KEY를 설정하세요.');
    }
    if (!adminEmail) {
      console.log('   💡 ADMIN_EMAIL을 설정하세요.');
    }
    console.log();
  }

  // ============================================================
  // 최종 결과
  // ============================================================
  console.log('='.repeat(60));
  
  // 결과 요약
  const allSuccess = (discordWebhookUrl ? discordSuccess : true) && (resendApiKey && adminEmail ? emailSuccess : true);
  const allConfigured = discordWebhookUrl && resendApiKey && adminEmail;
  
  if (allSuccess && allConfigured) {
    console.log('✅ 멀티 알림 시스템 검증 완료');
  } else if (discordSuccess && emailSuccess) {
    console.log('✅ 멀티 알림 시스템 검증 완료');
  } else {
    console.log('⚠️ 멀티 알림 시스템 부분 검증 완료');
  }
  
  console.log('='.repeat(60));
  console.log('\n검증 결과:');
  
  if (discordWebhookUrl) {
    console.log(`  ${discordSuccess ? '✅' : '❌'} Discord 알림: ${discordSuccess ? 'Success' : `Failed (${discordError})`}`);
  }
  
  if (resendApiKey && adminEmail) {
    console.log(`  ${emailSuccess ? '✅' : '❌'} 이메일 알림: ${emailSuccess ? 'Success' : `Failed (${emailError})`}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (discordSuccess && emailSuccess) {
    console.log('🎉 모든 알림 전송이 성공했습니다!');
    console.log('\n📱 확인사항:');
    console.log('   1. Discord 채널에서 테스트 메시지 확인');
    console.log('   2. 관리자 이메일(' + adminEmail + ')에서 테스트 이메일 확인');
    console.log('   3. 첨부파일 링크가 정상적으로 표시되는지 확인');
    console.log('\n');
    process.exit(0);
  } else if (discordSuccess || emailSuccess) {
    console.log('⚠️ 일부 알림만 성공했습니다.');
    if (!discordSuccess && discordWebhookUrl) {
      console.log('   - Discord 알림 실패 원인 확인 필요');
    }
    if (!emailSuccess && resendApiKey && adminEmail) {
      console.log('   - 이메일 알림 실패 원인 확인 필요');
    }
    console.log('\n');
    process.exit(1);
  } else {
    console.error('❌ 모든 알림 전송이 실패했습니다.');
    console.error('   환경 변수 및 설정을 확인해주세요.');
    console.log('\n');
    process.exit(1);
  }
}

// 스크립트 실행
testMultiNotification().catch((error) => {
  console.error('치명적 오류:', error);
  process.exit(1);
});
