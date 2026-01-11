/**
 * Discord Webhook 알림 유틸리티
 */

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
    footer?: {
      text: string;
    };
  }>;
}

/**
 * Discord Webhook으로 알림 메시지 전송
 */
export async function sendDiscordNotification(payload: DiscordWebhookPayload): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('DISCORD_WEBHOOK_URL 환경 변수가 설정되지 않았습니다.');
      }
      return {
        success: false,
        error: 'Discord Webhook URL이 설정되지 않았습니다.',
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error('Discord Webhook 오류:', response.status, errorText);
      }
      return {
        success: false,
        error: `Discord 알림 전송 실패: ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Discord 알림 전송 중 예외 발생:', error);
    }
    return {
      success: false,
      error: 'Discord 알림 전송 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 문의 접수 Discord 알림 생성
 */
export function createContactNotificationPayload(data: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  attachmentUrl?: string | null;
  createdAt?: string;
}): DiscordWebhookPayload {
  const fields = [
    {
      name: '📧 **이메일**',
      value: data.email || '-',
      inline: true,
    },
    {
      name: '📞 **연락처**',
      value: data.phone || '-',
      inline: true,
    },
    {
      name: '💬 **메시지**',
      value: data.message.length > 1000 
        ? data.message.substring(0, 1000) + '...' 
        : data.message,
      inline: false,
    },
  ];

  if (data.attachmentUrl) {
    fields.push({
      name: '📎 **첨부파일**',
      value: `[이미지 보기](${data.attachmentUrl})`,
      inline: false,
    });
  }

  return {
    embeds: [
      {
        title: '🔔 새 문의 접수!',
        description: `**이름**: ${data.name}`,
        color: 0xf59e0b, // Amber 색상 (RGB: 245, 158, 11)
        fields,
        timestamp: data.createdAt || new Date().toISOString(),
        footer: {
          text: 'Ember Coffee 문의 시스템',
        },
      },
    ],
  };
}
