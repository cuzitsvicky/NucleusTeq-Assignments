async function apiRequest(endpoint, options = {}, token = null) {
  const headers = { ...options.headers };

  if (token) headers.Authorization = `Basic ${token}`;
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, { ...options, headers });

  if (response.headers.get('content-type') === 'application/pdf') {
    return response.blob();
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    if (data?.errors?.length) errorMsg = data.errors[0].message.replace('Value error, ', '');
    else if (data?.message) errorMsg = data.message;
    else if (data?.detail) errorMsg = data.detail;
    throw new Error(errorMsg);
  }

  return data;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  return query.toString();
}

export const apiService = {
  login: (email, password) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getMe: token => apiRequest('/api/auth/me', { method: 'GET' }, token),
  resetPassword: (token, newPassword) => apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword })
  }, token),
  registerUser: (token, userData) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }, token),
  getUsers: (token, page = 1, limit = 10, filters = {}) => {
    const query = buildQuery({ page, limit, ...filters });
    return apiRequest(`/api/auth/users?${query}`, {}, token);
  },
  updateUser: (token, id, userData) => apiRequest(`/api/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }, token),
  getJobs: (token, page = 1, limit = 10, filters = {}) => {
    const query = buildQuery({ page, limit, ...filters });
    return apiRequest(`/api/jobs/?${query}`, {}, token);
  },
  createJob: (token, jobData) => apiRequest('/api/jobs/', {
    method: 'POST',
    body: JSON.stringify(jobData)
  }, token),
  updateJob: (token, id, jobData) => apiRequest(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  }, token),
  getCandidates: (token, page = 1, limit = 10, filters = {}) => {
    const query = buildQuery({ page, limit, ...filters });
    return apiRequest(`/api/candidates/?${query}`, {}, token);
  },
  createCandidate: (token, formData) => apiRequest('/api/candidates/', {
    method: 'POST',
    body: formData
  }, token),
  updateCandidate: (token, id, candidateData) => apiRequest(`/api/candidates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(candidateData)
  }, token),
  updateCandidateStatus: (token, id, status) => apiRequest(`/api/candidates/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }, token),
  getCandidateHistory: (token, id, page = 1, limit = 10) => {
    const query = buildQuery({ page, limit });
    return apiRequest(`/api/candidates/${id}/history?${query}`, {}, token);
  },
  downloadResume: async (token, id) => {
    const blob = await apiRequest(`/api/candidates/${id}/resume`, {}, token);
    return URL.createObjectURL(blob);
  },
  getActiveInterviewers: (token, page = 1, limit = 10) => {
    const query = buildQuery({ page, limit });
    return apiRequest(`/api/auth/interviewers?${query}`, {}, token);
  },
  getInterviews: (token, page = 1, limit = 10) => apiRequest(`/api/interviews/?${buildQuery({ page, limit })}`, {}, token),
  scheduleInterview: (token, data) => apiRequest('/api/interviews/schedule', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token),
  submitFeedback: (token, id, data) => apiRequest(`/api/interviews/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data)
  }, token)
};
