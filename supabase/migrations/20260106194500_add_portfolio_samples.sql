-- Insert 3 new sample portfolio items
INSERT INTO public.portfolio_items 
(title, category, client_name, video_url, thumbnail_url, description, tags, is_public, sort_order) 
VALUES
(
    'IFBB Pro League - Mr. Olympia 2025', 
    'Documentary', 
    'IFBB Pro League', 
    'https://www.youtube.com/embed/PjGk8_Q6Igw', 
    'https://img.youtube.com/vi/PjGk8_Q6Igw/maxresdefault.jpg', 
    'The official cinematic documentary of the Mr. Olympia 2025 journey. Capturing the sweat, sacrifice, and glory of the world''s top bodybuilders on the biggest stage.', 
    ARRAY['Bodybuilding', 'Documentary', 'Cinematic'], 
    true, 
    10
),
(
    'Under Armour - Project Rock', 
    'Commercial', 
    'Under Armour', 
    'https://www.youtube.com/embed/N-4T-jYwP1U', 
    'https://img.youtube.com/vi/N-4T-jYwP1U/maxresdefault.jpg', 
    'High-intensity commercial spot for the new Project Rock collection. Filmed on RED Komodo with anamorphic lenses for a gritty, raw aesthetic.', 
    ARRAY['Fitness', 'Commercial', 'Gear'], 
    true, 
    11
),
(
    'Gymshark - Be a Visionary', 
    'Reels', 
    'Gymshark', 
    'https://www.youtube.com/embed/v7XFj4JgXpA', 
    'https://img.youtube.com/vi/v7XFj4JgXpA/maxresdefault.jpg', 
    'Vertical campaign series designed for high viral potential on social media. Fast cuts, dynamic transitions, and pumping bass.', 
    ARRAY['Social Media', 'Vertical', 'Lifestyle'], 
    true, 
    12
);
