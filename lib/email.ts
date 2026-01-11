/**
 * 이메일 알림 유틸리티 (Resend)
 */

import { Resend } from 'resend';

// Resend 클라이언트는 API 키가 있을 때만 생성
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
};

export interface EmailContactData {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  attachmentUrl?: string | null;
  createdAt?: string;
}

/**
 * 관리자에게 문의 접수 알림 이메일 전송
 */
export async function sendAdminEmail(data: EmailContactData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (!adminEmail) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('ADMIN_EMAIL 환경 변수가 설정되지 않았습니다.');
      }
      return {
        success: false,
        error: '관리자 이메일이 설정되지 않았습니다.',
      };
    }

    if (!process.env.RESEND_API_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('RESEND_API_KEY 환경 변수가 설정되지 않았습니다.');
      }
      return {
        success: false,
        error: 'Resend API 키가 설정되지 않았습니다.',
      };
    }

    const emailSubject = `[Ember Coffee] 새 문의가 도착했습니다: ${data.name}님`;
    
    // HTML 이메일 본문
    const emailHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">☕ Ember Coffee</h1>
    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 14px;">새로운 문의가 접수되었습니다</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
      📝 문의 정보
    </h2>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold; width: 120px;">
          👤 이름
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">
          ${escapeHtml(data.name)}
        </td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">
          📧 이메일
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">
          <a href="mailto:${escapeHtml(data.email)}" style="color: #f59e0b; text-decoration: none;">
            ${escapeHtml(data.email)}
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">
          📞 연락처
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">
          ${data.phone ? `<a href="tel:${escapeHtml(data.phone)}" style="color: #f59e0b; text-decoration: none;">${escapeHtml(data.phone)}</a>` : '-'}
        </td>
      </tr>
      ${data.attachmentUrl ? `
      <tr>
        <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: bold;">
          📎 첨부파일
        </td>
        <td style="padding: 12px; border: 1px solid #e5e7eb;">
          <a href="${escapeHtml(data.attachmentUrl)}" target="_blank" style="color: #f59e0b; text-decoration: none; font-weight: bold;">
            이미지 보기 →
          </a>
        </td>
      </tr>
      ` : ''}
    </table>
    
    <h3 style="color: #374151; margin-top: 30px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
      💬 문의 내용
    </h3>
    <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #f59e0b; white-space: pre-wrap; word-wrap: break-word;">
${escapeHtml(data.message)}
    </div>
    
    <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 5px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>⏰ 접수 시간:</strong> ${data.createdAt ? new Date(data.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">
      이 이메일은 Ember Coffee 문의 시스템에서 자동으로 발송되었습니다.<br>
      관리자 대시보드에서 더 자세한 정보를 확인할 수 있습니다.
    </p>
  </div>
</body>
</html>
    `;

    // 텍스트 버전 (HTML을 지원하지 않는 클라이언트용)
    const emailText = `
☕ Ember Coffee - 새 문의 접수

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 문의 정보

👤 이름: ${data.name}
📧 이메일: ${data.email}
📞 연락처: ${data.phone || '-'}
${data.attachmentUrl ? `📎 첨부파일: ${data.attachmentUrl}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 문의 내용

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ 접수 시간: ${data.createdAt ? new Date(data.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이 메시지는 Ember Coffee 문의 시스템에서 자동으로 발송되었습니다.
    `;

    const resend = getResendClient();
    if (!resend) {
      return {
        success: false,
        error: 'Resend 클라이언트를 초기화할 수 없습니다.',
      };
    }

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    if (emailError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Resend 이메일 전송 오류:', emailError);
      }
      return {
        success: false,
        error: `이메일 전송 실패: ${emailError.message || '알 수 없는 오류'}`,
      };
    }

    return {
      success: true,
      messageId: emailData?.id,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('이메일 전송 중 예외 발생:', error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : '이메일 전송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * HTML 이스케이프 유틸리티
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
