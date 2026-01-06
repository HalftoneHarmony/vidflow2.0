-- Update the color for the READY stage to purple
UPDATE public.pipeline_stages
SET color = 'purple'
WHERE code = 'READY';

-- Update the color for the WAITING stage to zinc (just to be sure, though it likely is already)
UPDATE public.pipeline_stages
SET color = 'zinc'
WHERE code = 'WAITING';

-- Update the color for the EDITING stage to blue
UPDATE public.pipeline_stages
SET color = 'blue'
WHERE code = 'EDITING';

-- Update the color for the DELIVERED stage to green
UPDATE public.pipeline_stages
SET color = 'green'
WHERE code = 'DELIVERED';
