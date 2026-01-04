
-- Seed default values for About Page
-- This depends on general_settings table existing

INSERT INTO public.general_settings (key, value, description)
VALUES 
    ('about_title', 'ABOUT VIDFLOW', 'Title of the About page'),
    ('about_content', 'VidFlow is the premier bodybuilding video production engine. We capture the raw intensity and aesthetic perfection of the sport. Our mission is to deliver zero-omission, maximum-impact visual experiences for athletes and fans alike.', 'Content of the About page')
ON CONFLICT (key) DO NOTHING;
