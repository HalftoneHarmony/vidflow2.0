-- Populate site_logo_symbol if not exists
SELECT public.upsert_setting('site_logo_symbol', 'V');

-- Ensure site_name is set (re-run just in case)
SELECT public.upsert_setting('site_name', 'VidFlow');
