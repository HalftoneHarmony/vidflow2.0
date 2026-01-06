-- Populate general settings with default values for the Showcase page

-- Page Title & Description (if not already set)
SELECT public.upsert_setting('showcase_title', 'SHOWCASE 2.0');
SELECT public.upsert_setting('showcase_desc', '당신의 무대를 가장 완벽하게 담아내는 VidFlow만의 퀄리티를 직접 확인하세요.
4K 초고화질과 다이나믹한 편집의 차이를 경험할 수 있습니다.');

-- Sidebar & Overlay Labels
SELECT public.upsert_setting('showcase_sidebar_title', 'CHOOSE STAGE');
SELECT public.upsert_setting('showcase_select_package_text', 'Select Package');
SELECT public.upsert_setting('showcase_playing_text', 'PLAYING');
SELECT public.upsert_setting('showcase_no_video_text', '재생할 영상이 없습니다.');
SELECT public.upsert_setting('showcase_package_details_placeholder', 'Package details...');

-- Note: 'showcase_now_playing_label' was mentioned but not seemingly used in the code scan, 
-- but 'PLAYING' (showcase_playing_text) is used in the sidebar.

-- Ensure the function is accessible (re-stating policy if needed, but existing migration covers it)
