-- Add missing General Settings defaults
INSERT INTO public.general_settings (key, value, description) VALUES
('footer_description', 'The definitive platform for bodybuilding cinematography. Built for impact. Designed for domination.', 'Text displayed in the footer branding column'),
('footer_newsletter_title', 'Stay Updated', 'Title for the newsletter section'),
('footer_newsletter_text', 'Join the elite circle. Get updates on new features and exclusive events.', 'Description key for the newsletter'),
('social_instagram', '#', 'Instagram profile URL'),
('social_youtube', '#', 'YouTube channel URL'),
('social_twitter', '#', 'Twitter/X profile URL'),
('meta_keywords', '보디빌딩, 영상 제작, 대회 촬영, VidFlow', 'Comma separated SEO keywords')
ON CONFLICT (key) DO NOTHING;
