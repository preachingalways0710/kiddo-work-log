-- Add unique constraint for worker_name and date combination
-- This is needed for the upsert operation in check-in/check-out functionality
ALTER TABLE public.attendance 
ADD CONSTRAINT unique_worker_date UNIQUE (worker_name, date);