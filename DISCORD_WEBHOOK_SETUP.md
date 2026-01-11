# Discord Webhook 설정 가이드

## 1. Discord Webhook URL 생성 방법

### 단계별 안내

1. **Discord 앱 열기**
   - Discord 데스크톱 앱 또는 웹 브라우저에서 Discord에 로그인

2. **채널 설정 열기**
   - 알림을 받고 싶은 Discord 채널 선택
   - 채널 이름 옆의 ⚙️(톱니바퀴) 아이콘 클릭 또는 우클릭 → "채널 편집"

3. **연동 메뉴로 이동**
   - 좌측 메뉴에서 "연동" (Integrations) 클릭

4. **웹후크 생성**
   - "웹후크 만들기" 또는 "새 웹후크" (Create Webhook) 클릭
   - 웹후크 이름 입력 (예: "Ember Coffee 문의 알림")
   - 웹후크 아이콘 설정 (선택사항)
   - "웹후크 URL 복사" (Copy Webhook URL) 클릭

5. **웹후크 저장**
   - 복사한 URL을 `.env.local` 파일에 추가 (아래 참고)

## 2. 환경 변수 설정

### `.env.local` 파일에 추가

프로젝트 루트의 `.env.local` 파일을 열고 다음 내용을 추가하세요:

```env
# Discord Webhook URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### 주의사항

- ⚠️ **절대 공개 저장소에 커밋하지 마세요!**
- `.env.local`은 `.gitignore`에 포함되어 있어야 합니다
- Webhook URL이 유출되면 누구나 해당 채널에 메시지를 보낼 수 있습니다
- 필요시 Discord에서 웹후크를 삭제하고 새로 생성할 수 있습니다

## 3. Vercel 배포 시 환경 변수 설정

배포된 환경에서도 Discord 알림을 받으려면:

1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings > Environment Variables 메뉴
4. `DISCORD_WEBHOOK_URL` 추가
5. 재배포 (Redeploy)

## 4. 테스트

1. `.env.local`에 `DISCORD_WEBHOOK_URL` 추가
2. 개발 서버 재시작 (`npm run dev`)
3. 문의 폼에서 테스트 문의 제출
4. Discord 채널에서 알림 메시지 확인

## 5. 보안 팁

- 웹후크 URL은 비공개로 유지하세요
- 정기적으로 웹후크를 재생성하여 보안을 강화하세요
- 프로덕션 환경에서는 알림 채널을 별도로 관리하세요
