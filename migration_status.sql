-- Run this SQL in your Supabase SQL Editor

-- 1. Scan existing rows and add a temporary status based on is_completed
ALTER TABLE todos ADD COLUMN status text DEFAULT 'todo';

UPDATE todos SET status = 'done' WHERE is_completed = true;
UPDATE todos SET status = 'todo' WHERE is_completed = false;

-- 2. Make status required and enforce constraints
ALTER TABLE todos ALTER COLUMN status SET NOT NULL;
ALTER TABLE todos ADD CONSTRAINT status_check CHECK (status IN ('todo', 'in-progress', 'done'));

-- 3. (Optional) You can drop the old is_completed column if you want, 
-- or keep it sync via triggers, but for this app we will switch to using 'status'.
-- ALTER TABLE todos DROP COLUMN is_completed;
