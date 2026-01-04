-- Ensure general_settings table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.general_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent creation validation not easily doable in raw SQL without DO block, but acceptable to try/fail if exists or use DO block)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'general_settings' AND policyname = 'Anyone can view settings'
    ) THEN
        CREATE POLICY "Anyone can view settings" ON public.general_settings FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'general_settings' AND policyname = 'Admins can manage settings'
    ) THEN
        CREATE POLICY "Admins can manage settings" ON public.general_settings FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
        );
    END IF;
END
$$;

-- Helper function
CREATE OR REPLACE FUNCTION public.upsert_setting(setting_key TEXT, setting_value TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.general_settings (key, value)
  VALUES (setting_key, setting_value)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Populate default values for General Settings
SELECT public.upsert_setting('site_name', 'VidFlow');
SELECT public.upsert_setting('support_email', 'support@vidflow.com');
SELECT public.upsert_setting('maintenance_mode', 'false');
SELECT public.upsert_setting('seo_title', 'VidFlow - Professional Video Production');
SELECT public.upsert_setting('seo_description', 'High quality video production for your events.');
