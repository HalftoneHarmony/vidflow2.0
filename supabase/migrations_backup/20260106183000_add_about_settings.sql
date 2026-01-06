
-- Add missing About page settings with default values

INSERT INTO public.general_settings (key, value, description)
VALUES 
    ('about_est_date', 'Est. 2026', 'Establishment date badge text'),
    ('about_hero_btn_primary', 'Explore Our Work', 'Primary hero button text'),
    ('about_hero_btn_secondary', 'The Mission', 'Secondary hero button text'),
    ('about_bg_text', 'ALPHA', 'Large background text in narrative section'),
    ('about_manifesto_quote', 'PERFECTION ISN''T THE GOAL.<br/> DOMINANCE IS.', 'Manifesto quote box text (supports HTML/BR)'),
    ('about_manifesto_badge', 'ULTRA PREMIUM <br/> QUALITY ENGINE', 'Manifesto circular badge text (supports HTML/BR)'),
    ('about_cta_btn', 'Get Started', 'CTA button text'),
    ('about_footer_brand', 'VIDFLOW', 'Large footer brand text')
ON CONFLICT (key) DO NOTHING;
