-- Create table for storing general site settings (key-value text based)
CREATE TABLE IF NOT EXISTS public.general_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.general_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can view settings" ON public.general_settings
  FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage settings" ON public.general_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Helper function to upsert setting
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
