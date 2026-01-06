
-- Add missing image and layout settings for About page

INSERT INTO public.general_settings (key, value, description)
VALUES 
    ('about_hero_image', '/images/about/hero.png', 'Hero section background image URL'),
    ('about_manifesto_image', '/images/about/hero.png', 'Manifesto section side image URL'),
    ('about_grid_image', '/grid.svg', 'Background grid pattern URL'),
    ('about_manifesto_label', 'Manifesto', 'Small label above Manifesto title')
ON CONFLICT (key) DO NOTHING;
