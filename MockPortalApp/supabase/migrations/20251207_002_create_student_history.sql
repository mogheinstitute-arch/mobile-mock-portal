/*
  # Student Test History Table
  
  Creates a simple table to store test history using email as identifier
  (since the app uses local authentication, not Supabase Auth)
*/

CREATE TABLE IF NOT EXISTS student_test_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email text NOT NULL,
  test_name text NOT NULL,
  test_id text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  correct_answers integer NOT NULL,
  wrong_answers integer NOT NULL,
  unattempted integer NOT NULL,
  time_taken integer NOT NULL,
  violations integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_test_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on student_test_history"
  ON student_test_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_student_test_history_email ON student_test_history(student_email);
CREATE INDEX idx_student_test_history_submitted_at ON student_test_history(submitted_at DESC);
