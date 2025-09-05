-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER NOT NULL, -- in minutes
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_sessions table
CREATE TABLE public.work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL, -- keeping this for flexibility
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  description TEXT,
  duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON public.work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.jobs (title, description, estimated_time, status) VALUES
  ('Clean the garage', 'Organize tools and sweep the floor', 120, 'pending'),
  ('Mow the lawn', 'Cut grass in front and back yard', 90, 'pending'),
  ('Wash car', 'Full car wash and vacuum interior', 60, 'completed'),
  ('Paint fence', 'Paint the backyard fence white', 240, 'in_progress');

INSERT INTO public.work_sessions (job_title, start_time, end_time, description, duration) VALUES
  ('Wash car', '2024-01-15 09:00:00', '2024-01-15 10:00:00', 'Washed and vacuumed the car thoroughly', 60),
  ('Mow the lawn', '2024-01-14 14:00:00', '2024-01-14 15:30:00', 'Mowed front and back yard, edged around flower beds', 90),
  ('Clean garage', '2024-01-13 10:00:00', '2024-01-13 11:00:00', 'Organized tools and started sweeping', 60);