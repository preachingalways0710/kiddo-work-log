-- Clean up test/dummy data from work_sessions table
DELETE FROM work_sessions 
WHERE job_title IN ('Wash car', 'Mow the lawn', 'Clean garage') 
   OR start_time::date < '2025-09-01';

-- Clean up test attendance record with just "c" as name
DELETE FROM attendance 
WHERE worker_name = 'c' OR length(worker_name) < 2;