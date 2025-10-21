/*
  # Create Comprehensive Reports Schema for Stage 5

  1. New Tables
    - `comprehensive_reports`
      - `id` (uuid, primary key) - Unique report identifier
      - `report_id` (text) - Report ID from backend
      - `assessment_id` (text) - Associated assessment ID
      - `candidate_id` (text) - Candidate identifier
      - `job_id` (text) - Job profile identifier
      - `company_type` (text) - Type of company (product/service/analyst)
      - `generated_at` (timestamptz) - Report generation timestamp
      - `overall_score` (integer) - Overall assessment score (0-100)
      - `scorecard_data` (jsonb) - Detailed scorecard with competency scores
      - `ai_summary` (text) - AI-generated summary for recruiters
      - `bias_check` (jsonb) - Bias detection results
      - `communication_analytics` (jsonb) - Communication analysis data
      - `performance_breakdown` (jsonb) - Question-by-question breakdown
      - `improvement_plan` (jsonb) - Personalized improvement suggestions
      - `transcript_data` (jsonb) - Interview transcript
      - `key_moments` (jsonb) - Highlighted key moments
      - `recording_url` (text, nullable) - URL to interview recording
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Last update time

    - `assessment_history`
      - `id` (uuid, primary key) - Unique history entry
      - `candidate_id` (text) - Candidate identifier
      - `assessment_id` (text) - Assessment identifier
      - `company_type` (text) - Company type
      - `status` (text) - Assessment status
      - `started_at` (timestamptz) - Start time
      - `completed_at` (timestamptz, nullable) - Completion time
      - `overall_score` (integer, nullable) - Final score
      - `report_id` (text, nullable) - Link to comprehensive report
      - `created_at` (timestamptz) - Record creation time

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Add indexes for common queries

  3. Important Notes
    - JSONB columns store complex nested data from backend
    - Reports are linked to assessment history
    - Supports multiple attempts per candidate
*/

-- Create comprehensive_reports table
CREATE TABLE IF NOT EXISTS comprehensive_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id text UNIQUE NOT NULL,
  assessment_id text NOT NULL,
  candidate_id text NOT NULL,
  job_id text,
  company_type text NOT NULL CHECK (company_type IN ('product', 'service', 'analyst')),
  generated_at timestamptz NOT NULL DEFAULT now(),
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  scorecard_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_summary text,
  bias_check jsonb DEFAULT '{}'::jsonb,
  communication_analytics jsonb DEFAULT '{}'::jsonb,
  performance_breakdown jsonb DEFAULT '[]'::jsonb,
  improvement_plan jsonb DEFAULT '{}'::jsonb,
  transcript_data jsonb DEFAULT '{}'::jsonb,
  key_moments jsonb DEFAULT '[]'::jsonb,
  recording_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assessment_history table
CREATE TABLE IF NOT EXISTS assessment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id text NOT NULL,
  assessment_id text UNIQUE NOT NULL,
  company_type text NOT NULL CHECK (company_type IN ('product', 'service', 'analyst')),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  report_id text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_candidate_id ON comprehensive_reports(candidate_id);
CREATE INDEX IF NOT EXISTS idx_reports_assessment_id ON comprehensive_reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON comprehensive_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_candidate_id ON assessment_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_history_assessment_id ON assessment_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_history_completed_at ON assessment_history(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE comprehensive_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, these should be restricted to authenticated users

CREATE POLICY "Allow public read access to comprehensive_reports"
  ON comprehensive_reports FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to comprehensive_reports"
  ON comprehensive_reports FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to comprehensive_reports"
  ON comprehensive_reports FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to assessment_history"
  ON assessment_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to assessment_history"
  ON assessment_history FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to assessment_history"
  ON assessment_history FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for comprehensive_reports
DROP TRIGGER IF EXISTS update_comprehensive_reports_updated_at ON comprehensive_reports;
CREATE TRIGGER update_comprehensive_reports_updated_at
  BEFORE UPDATE ON comprehensive_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
