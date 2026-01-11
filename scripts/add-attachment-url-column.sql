-- contacts 테이블에 attachment_url 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- attachment_url 컬럼 추가
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- attachment_url 인덱스 생성 (선택사항, 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_attachment_url ON contacts(attachment_url) WHERE attachment_url IS NOT NULL;
