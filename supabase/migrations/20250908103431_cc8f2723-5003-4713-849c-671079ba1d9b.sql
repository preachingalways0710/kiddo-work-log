-- Add order field for draggable reordering
ALTER TABLE public.jobs 
ADD COLUMN display_order integer DEFAULT 0;

-- Add category field for later/someday jobs
ALTER TABLE public.jobs 
ADD COLUMN category text DEFAULT 'active' CHECK (category IN ('active', 'later'));

-- Create check-in/check-out tracking table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_name text NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_late_check_in boolean DEFAULT false,
  is_early_check_out boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance table
CREATE POLICY "Anyone can view attendance" 
ON public.attendance 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert attendance" 
ON public.attendance 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update attendance" 
ON public.attendance 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete attendance" 
ON public.attendance 
FOR DELETE 
USING (true);

-- Add trigger for attendance timestamps
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_jobs_display_order ON public.jobs(display_order);
CREATE INDEX idx_jobs_category ON public.jobs(category);