-- Add instagram_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS instagram_id TEXT;

-- Update the view or comments if necessary (optional)
COMMENT ON COLUMN public.profiles.instagram_id IS 'Instagram ID/Handle for the user';
