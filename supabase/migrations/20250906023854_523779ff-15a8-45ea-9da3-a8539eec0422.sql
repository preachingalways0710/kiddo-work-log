-- Add priority and assigned_days columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
ADD COLUMN assigned_days text[] DEFAULT ARRAY[]::text[];