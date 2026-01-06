-- Add disciplines to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS disciplines JSONB DEFAULT '[]'::jsonb;

-- Add discipline to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discipline TEXT;

-- Add comment
COMMENT ON COLUMN events.disciplines IS 'List of available disciplines/categories for this event (e.g. ["Bodybuilding", "Physique"])';
COMMENT ON COLUMN orders.discipline IS 'Selected discipline/category for this order';
