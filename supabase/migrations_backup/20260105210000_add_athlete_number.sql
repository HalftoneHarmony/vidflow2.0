-- Add athlete_number to orders table for participant identification
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS athlete_number TEXT;

COMMENT ON COLUMN orders.athlete_number IS 'Athlete/participant number entered by the customer during order';
