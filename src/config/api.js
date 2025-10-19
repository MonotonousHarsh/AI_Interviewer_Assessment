export const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  assessments: {
    create: '/assessments/create',
    get: (id) => `/assessments/${id}`,
    start: (id) => `/assessments/start/${id}`,
    progress: (id) => `/assessments/${id}/progress`,
  },
  codingRound: {
    start: (assessmentId) => `/assessments/${assessmentId}/coding_round/start`,
    submit: (roundId) => `/assessments/coding_round/${roundId}/submit`,
    progress: (roundId) => `/assessments/coding_round/${roundId}/progress`,
    complete: (roundId) => `/assessments/coding_round/${roundId}/complete`,
  },
  liveCoding: {
    start: (assessmentId) => `/assessments/${assessmentId}/live_coding/start`,
    chat: (roundId) => `/assessments/live_coding/${roundId}/chat`,
    code: (roundId) => `/assessments/live_coding/${roundId}/code`,
    run: (roundId) => `/assessments/live_coding/${roundId}/run`,
    complete: (roundId) => `/assessments/live_coding/${roundId}/complete`,
    status: (roundId) => `/assessments/live_coding/${roundId}/status`,
    chatHistory: (roundId) => `/assessments/live_coding/${roundId}/chat_history`,
  },
  systemDesign: {
    start: (assessmentId) => `/assessments/${assessmentId}/system_design/start`,
    chat: (roundId) => `/assessments/system_design/${roundId}/chat`,
    diagram: (roundId) => `/assessments/system_design/${roundId}/diagram`,
    complete: (roundId) => `/assessments/system_design/${roundId}/complete`,
    status: (roundId) => `/assessments/system_design/${roundId}/status`,
  },
  serviceCompany: {
    create: '/service/assessments/create',
    aptitudeTest: {
      start: (assessmentId) => `/service/assessments/${assessmentId}/aptitude_test/start`,
      questions: (roundId) => `/service/assessments/aptitude_test/${roundId}/questions`,
      submit: (roundId) => `/service/assessments/aptitude_test/${roundId}/submit`,
      results: (roundId) => `/service/assessments/aptitude_test/${roundId}/results`,
    },
    coreCompetency: {
      start: (assessmentId) => `/service/assessments/${assessmentId}/core_competency/start`,
      test: (roundId) => `/service/assessments/core_competency/${roundId}/test`,
      submit: (roundId) => `/service/assessments/core_competency/${roundId}/submit`,
      results: (roundId) => `/service/assessments/core_competency/${roundId}/results`,
    },
  },
};
