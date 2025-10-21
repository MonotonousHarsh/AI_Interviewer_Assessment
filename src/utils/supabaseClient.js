import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const saveComprehensiveReport = async (reportData) => {
  const { data, error } = await supabase
    .from('comprehensive_reports')
    .insert([{
      report_id: reportData.report_id,
      assessment_id: reportData.assessment_id,
      candidate_id: reportData.candidate_id,
      job_id: reportData.job_id || null,
      company_type: reportData.company_type || 'product',
      generated_at: reportData.generated_at,
      overall_score: reportData.overall_scorecard.overall_score,
      scorecard_data: reportData.overall_scorecard,
      ai_summary: reportData.ai_generated_summary,
      bias_check: reportData.bias_check,
      communication_analytics: reportData.communication_analytics,
      performance_breakdown: reportData.detailed_performance_breakdown,
      improvement_plan: reportData.improvement_plan,
      transcript_data: reportData.transcript,
      key_moments: reportData.key_moments,
      recording_url: reportData.recording_url
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getComprehensiveReport = async (reportId) => {
  const { data, error } = await supabase
    .from('comprehensive_reports')
    .select('*')
    .eq('report_id', reportId)
    .single();

  if (error) throw error;
  return data;
};

export const getCandidateReports = async (candidateId) => {
  const { data, error } = await supabase
    .from('comprehensive_reports')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const saveAssessmentHistory = async (historyData) => {
  const { data, error } = await supabase
    .from('assessment_history')
    .upsert([{
      candidate_id: historyData.candidate_id,
      assessment_id: historyData.assessment_id,
      company_type: historyData.company_type,
      status: historyData.status,
      started_at: historyData.started_at || new Date().toISOString(),
      completed_at: historyData.completed_at || null,
      overall_score: historyData.overall_score || null,
      report_id: historyData.report_id || null
    }], {
      onConflict: 'assessment_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCandidateHistory = async (candidateId) => {
  const { data, error } = await supabase
    .from('assessment_history')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateAssessmentStatus = async (assessmentId, status, completedAt = null, overallScore = null, reportId = null) => {
  const updateData = { status };

  if (completedAt) updateData.completed_at = completedAt;
  if (overallScore !== null) updateData.overall_score = overallScore;
  if (reportId) updateData.report_id = reportId;

  const { data, error } = await supabase
    .from('assessment_history')
    .update(updateData)
    .eq('assessment_id', assessmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
