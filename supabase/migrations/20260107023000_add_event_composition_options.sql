-- Add composition_options to events table
ALTER TABLE public.events 
ADD COLUMN composition_options TEXT[] DEFAULT ARRAY['VIDEO', 'PHOTO', 'HIGHLIGHT', 'RAW', 'REELS', 'DRONE', 'INTERVIEW'];

-- Update existing rows to have the default values
UPDATE public.events 
SET composition_options = ARRAY['VIDEO', 'PHOTO', 'HIGHLIGHT', 'RAW', 'REELS', 'DRONE', 'INTERVIEW']
WHERE composition_options IS NULL;
