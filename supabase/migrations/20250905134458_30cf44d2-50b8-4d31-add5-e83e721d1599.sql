-- Enable Row Level Security on both tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Create public access policies for jobs table (since no auth yet)
CREATE POLICY "Anyone can view jobs" ON public.jobs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update jobs" ON public.jobs
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete jobs" ON public.jobs
  FOR DELETE USING (true);

-- Create public access policies for work_sessions table (since no auth yet)
CREATE POLICY "Anyone can view work sessions" ON public.work_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert work sessions" ON public.work_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update work sessions" ON public.work_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete work sessions" ON public.work_sessions
  FOR DELETE USING (true);