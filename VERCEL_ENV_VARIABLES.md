# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

Vercel Dashboard > Settings > Environment Variables에서 다음 변수들을 추가하세요.

### 1. Supabase 설정

```
NEXT_PUBLIC_SUPABASE_URL
```
- **값**: Supabase 프로젝트 URL
- **예시**: `https://ycwrrxxoowtgphlytnts.supabase.co`
- **설명**: Supabase 프로젝트의 공개 URL
- **환경**: Production, Preview, Development 모두

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **값**: Supabase Anon Key
- **설명**: Supabase 프로젝트의 공개 API 키 (anon role)
- **환경**: Production, Preview, Development 모두
- **참고**: Supabase Dashboard > Settings > API에서 확인 가능

### 2. 관리자 비밀번호

```
NEXT_PUBLIC_ADMIN_PASSWORD
```
- **값**: 관리자 대시보드 접근 비밀번호
- **예시**: `your-secure-password-here`
- **설명**: `/admin` 경로 접근 시 필요한 비밀번호
- **환경**: Production, Preview, Development 모두
- **보안 권장사항**: 
  - 강력한 비밀번호 사용 (최소 12자 이상)
  - Production과 Development 환경에 다른 비밀번호 설정 권장

## 환경별 설정 권장사항

### Production (프로덕션)
- 모든 환경 변수 설정 필수
- `NEXT_PUBLIC_ADMIN_PASSWORD`는 강력한 비밀번호 사용

### Preview (프리뷰)
- 모든 환경 변수 설정 필수
- Production과 동일한 Supabase 프로젝트 사용 가능

### Development (개발)
- 로컬 개발 시 `.env.local` 파일 사용
- Vercel CLI 사용 시 환경 변수 자동 동기화

## 설정 방법

1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings > Environment Variables 이동
4. 각 변수 추가:
   - Key: 변수 이름
   - Value: 변수 값
   - Environment: 적용할 환경 선택
5. Save 클릭
6. 배포 재실행 (환경 변수 변경 후 필요)

## 로컬 개발 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

**중요**: `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
