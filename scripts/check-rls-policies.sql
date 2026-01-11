-- RLS 정책 확인 및 수정 쿼리
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

-- 기존 정책 삭제 (필요한 경우)
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;

-- RLS 정책 재생성 (더 명확한 정책)
CREATE POLICY "Allow anonymous inserts to contacts"
  ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 정책 확인
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
