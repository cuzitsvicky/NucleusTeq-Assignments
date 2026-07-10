/**
 * Helper function to handle all HTTP requests.
 * Automatically injects authentication headers, formats request bodies,
 * and parses response formats (JSON or PDF Blob) while performing error handling.
 */
async function apiRequest(endpoint, options = {}, token = null) {
  const headers = { ...options.headers };

  // Set up Basic authentication header if a token is provided
  if (token) headers.Authorization = `Basic ${token}`;
  
  // Set Content-Type to JSON unless we are sending FormData or headers already specify Content-Type
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, { ...options, headers });

  // Handle PDF files directly (e.g., resume downloads)
  if (response.headers.get('content-type') === 'application/pdf') {
    return response.blob();
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  // Handle non-2xx status codes by extracting descriptive error messages
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    if (data?.errors?.length) {
      errorMsg = data.errors[0].message.replace('Value error, ', '');
    } else if (data?.message) {
      errorMsg = data.message;
    } else if (data?.detail) {
      errorMsg = data.detail;
    }
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Helper function to construct query strings from parameter objects.
 * Filters out undefined, null, or empty string values.
 */
function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  return query.toString();
}

/**
 * Service object containing API wrapper methods for communication with the backend server.
 */
export const apiService = {
  
  // AUTHENTICATION & USER MANAGEMENT

  /**
   * Logs in a user.
   */
  login: (email, password) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  /**
   * Fetches details of the currently authenticated user.
   */
  getMe: token => apiRequest('/api/auth/me', { method: 'GET' }, token),

  /**
   * Resets the password of the current/targeted user.
   */
  resetPassword: (token, newPassword) => apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword })
  }, token),

  /**
   * Registers a new user in the system (Admin only function).
   */
  registerUser: (token, userData) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }, token),

  /**
   * Retrieves a list of registered users with pagination and search/filtering options.
   */
  getUsers: (token, page = 1, limit = 10, filters = {}) => {
    const query = buildQuery({ page, limit, ...filters });
    return apiRequest(`/api/auth/users?${query}`, {}, token);
  },

  /**
   * Updates user details (e.g. name, role, status).
   */
  updateUser: (token, id, userData) => apiRequest(`/api/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }, token),


  // JOB MANAGEMENT

  /**
   * Retrieves jobs list with pagination and search/filtering.
   */
  getJobs: (token, page = 1, limit = 10, filters = {}) => {
    const query = buildQuery({ page, limit, ...filters });
    return apiRequest(`/api/jobs/?${query}`, {}, token);
  },

  /**
   * Creates a new job posting.
   */
  createJob: (token, jobData) => apiRequest('/api/jobs/', {
    method: 'POST',
    body: JSON.stringify(jobData)
  }, token),

  /**
   * Updates an existing job posting.
   */
  updateJob: (token, id, jobData) => apiRequest(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  }, token),


  // CANDIDATE MANAGEMENT

  /**
   * Retrieves a list of candidates with pagination and search filters.
   */
  getCandidates: (token, page = 1, limit = 10, filters = {}) => {
    const query = buildQuery({ page, limit, ...filters });
    return apiRequest(`/api/candidates/?${query}`, {}, token);
  },

  /**
   * Creates a new candidate. Supports uploading a resume via FormData.
   */
  createCandidate: (token, formData) => apiRequest('/api/candidates/', {
    method: 'POST',
    body: formData
  }, token),

  /**
   * Updates candidate profile information.
   */
  updateCandidate: (token, id, candidateData) => apiRequest(`/api/candidates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(candidateData)
  }, token),

  /**
   * Updates candidate status (e.g., Applied, Interviewing, Selected, Rejected).
  */
  updateCandidateStatus: (token, id, status) => apiRequest(`/api/candidates/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }, token),

  /**
   * Retrieves history logs/activity timeline for a candidate.
   */
  getCandidateHistory: (token, id, page = 1, limit = 10) => {
    const query = buildQuery({ page, limit });
    return apiRequest(`/api/candidates/${id}/history?${query}`, {}, token);
  },

  /**
   * Downloads a candidate's resume and returns a temporary local object URL.
   */
  downloadResume: async (token, id) => {
    const blob = await apiRequest(`/api/candidates/${id}/resume`, {}, token);
    return URL.createObjectURL(blob);
  },


  // INTERVIEW & INTERVIEWER MANAGEMENT

  /**
   * Retrieves a list of active interviewers with pagination support.
   */
  getActiveInterviewers: (token, page = 1, limit = 10) => {
    const query = buildQuery({ page, limit });
    return apiRequest(`/api/auth/interviewers?${query}`, {}, token);
  },

  /**
   * Retrieves a list of interviews with pagination.
   */
  getInterviews: (token, page = 1, limit = 10) => apiRequest(`/api/interviews/?${buildQuery({ page, limit })}`, {}, token),

  /**
   * Schedules a new interview.
   */
  scheduleInterview: (token, data) => apiRequest('/api/interviews/schedule', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token),

  /**
   * Updates details of an existing interview schedule.
   */
  updateInterview: (token, id, data) => apiRequest(`/api/interviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, token),

  /**
   * Submits feedback for a specific interview.
   */
  submitFeedback: (token, id, data) => apiRequest(`/api/interviews/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data)
  }, token),

  
  // DASHBOARD

  /**
   * Fetches key metrics and statistical data for the dashboard.
   */
  getDashboardStats: token => apiRequest('/api/dashboard/', {}, token)
};
