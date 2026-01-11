-- Supabase Storage 버킷 생성 및 정책 설정
-- Supabase Dashboard > Storage에서 수동으로 버킷을 생성하거나, SQL Editor에서 실행하세요

-- Storage 버킷 생성 (Storage > Buckets에서 수동 생성 권장)
-- 아래는 정책만 설정하는 SQL입니다.

-- 버킷 정책: 누구나 업로드 가능
-- Storage > Buckets > contact-attachments > Policies에서 설정하거나 아래 SQL 사용
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-attachments', 'contact-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 업로드 정책: 누구나 업로드 가능
CREATE POLICY "Anyone can upload to contact-attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'contact-attachments');

-- 읽기 정책: 누구나 읽기 가능 (공개 버킷)
CREATE POLICY "Anyone can view contact-attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'contact-attachments');

-- 참고: Supabase Dashboard > Storage > New bucket에서 수동으로 생성하는 것이 더 안전합니다.
-- 버킷 이름: contact-attachments
-- Public bucket: Yes
