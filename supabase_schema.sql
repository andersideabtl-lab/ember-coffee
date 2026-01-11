-- Supabase 데이터베이스 테이블 생성 쿼리
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- contacts 테이블 생성
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이메일 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- 생성일 인덱스 생성 (최신 문의 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 문의를 생성할 수 있도록 정책 설정 (익명 사용자 포함)
CREATE POLICY "Anyone can insert contacts"
  ON contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 관리자 또는 인증된 사용자만 조회할 수 있도록 정책 설정 (선택사항)
-- 필요에 따라 아래 정책을 추가하세요
-- CREATE POLICY "Authenticated users can view contacts"
--   ON contacts
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- updated_at 자동 업데이트 함수 (선택사항)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성 (선택사항)
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
