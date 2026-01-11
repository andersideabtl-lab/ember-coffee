-- Supabase RLS SELECT 정책 설정
-- 관리자 대시보드에서 contacts 테이블을 조회하기 위한 정책
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 현재 RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'contacts';

-- 기존 SELECT 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
DROP POLICY IF EXISTS "Admin can view contacts" ON contacts;

-- 옵션 1: 인증된 사용자만 조회 가능 (서비스 역할 키 사용 시)
-- 이 정책은 authenticated 역할(로그인한 사용자)만 조회할 수 있도록 합니다.
-- 주의: 현재는 anon 키를 사용하므로 이 정책만으로는 작동하지 않습니다.
CREATE POLICY "Authenticated users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- 옵션 2: 모든 사용자가 조회 가능 (개발/테스트용, 비권장)
-- 프로덕션 환경에서는 보안상 권장하지 않습니다.
-- CREATE POLICY "Anyone can view contacts"
--   ON contacts
--   FOR SELECT
--   TO anon, authenticated
--   USING (true);

-- 옵션 3: 서비스 역할 키 사용 (권장)
-- 관리자 대시보드는 서버 사이드에서만 실행되므로,
-- 서비스 역할 키(service_role key)를 사용하면 RLS를 우회할 수 있습니다.
-- 이 경우 별도의 SELECT 정책이 필요하지 않습니다.
-- 
-- 사용 방법:
-- 1. Supabase Dashboard > Settings > API에서 service_role key 복사
-- 2. .env.local에 NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY 추가 (주의: 보안)
-- 3. 또는 서버 사이드에서만 사용하도록 별도 클라이언트 생성

-- 정책 확인
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'contacts';
