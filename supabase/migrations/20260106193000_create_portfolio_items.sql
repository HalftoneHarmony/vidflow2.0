-- =============================================
-- Portfolio Items Table & Sample Data
-- Created by: Antigravity Agent
-- Date: 2026-01-06
-- Purpose: Create table for independent portfolio items (Commercials, Docs, etc.)
-- =============================================

-- 1. Create portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Commercial', 'Reels', 'Documentary', 'Music Video', etc.
    client_name TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Public read access
CREATE POLICY "Public can view published portfolio items" ON public.portfolio_items
    FOR SELECT USING (is_public = true);

-- Admin full access
CREATE POLICY "Admins can manage portfolio items" ON public.portfolio_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

-- 4. Sample Data
INSERT INTO public.portfolio_items 
(title, category, client_name, video_url, thumbnail_url, description, tags, is_public, sort_order) 
VALUES
(
    'Galaxy S24 Ultra - Official Film', 
    'Commercial', 
    'Samsung Electronics', 
    'https://www.youtube.com/embed/txrxH2dceCg', 
    'https://img.youtube.com/vi/txrxH2dceCg/maxresdefault.jpg', 
    'Cinematic product showcase featuring the new AI capabilities of Galaxy S24 Ultra. Directed for maximum visual impact.', 
    ARRAY['Tech', 'Product', 'Cinematic'], 
    true, 
    1
),
(
    'Nike - Dream Further', 
    'Commercial', 
    'Nike Korea', 
    'https://www.youtube.com/embed/0k700gO4XqM', 
    'https://img.youtube.com/vi/0k700gO4XqM/maxresdefault.jpg', 
    'High-energy sports campaign featuring top athletes. Focused on dynamic movement and emotional storytelling.', 
    ARRAY['Sports', 'Energy', 'Motivation'], 
    true, 
    2
),
(
    'Soul of Seoul', 
    'Documentary', 
    'Seoul Tourism Org', 
    'https://www.youtube.com/embed/F0B7HDiYkJE', 
    'https://img.youtube.com/vi/F0B7HDiYkJE/maxresdefault.jpg', 
    'A mini-documentary exploring the contrast between traditional palaces and modern skylines in Seoul.', 
    ARRAY['Travel', 'Culture', '4K'], 
    true, 
    3
),
(
    'Fashion Week Highlights', 
    'Reels', 
    'Vogue Korea', 
    'https://www.youtube.com/embed/3j5_eK5k5jE', 
    'https://img.youtube.com/vi/3j5_eK5k5jE/maxresdefault.jpg', 
    'Vertical short-form content designed for Instagram Reels and TikTok, capturing the essence of Seoul Fashion Week.', 
    ARRAY['Fashion', 'Vertical', 'Trendy'], 
    true, 
    4
),
(
    'BMW M4 - The Drop',
    'Commercial',
    'BMW Korea',
    'https://www.youtube.com/embed/sample_bmw',
    'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=1000',
    'Dynamic driving shots and exhaust sounds. Produced with high-speed tracking vehicle.',
    ARRAY['Automotive', 'Speed', 'Luxury'],
    true,
    5
);
