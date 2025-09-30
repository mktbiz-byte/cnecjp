-- campaign_applications テーブルの構造確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'campaign_applications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
