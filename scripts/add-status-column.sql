-- contacts 테이블에 status 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- status 컬럼 추가 (기본값: 'pending')
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed'));

-- status 인덱스 생성 (미처리 문의 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- 기존 데이터의 status를 'pending'으로 설정 (NULL인 경우)
UPDATE contacts SET status = 'pending' WHERE status IS NULL;
