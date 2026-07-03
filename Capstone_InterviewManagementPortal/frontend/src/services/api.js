async function apiRequest(endpoint, options = {}, token = null) {
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Basic ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(endpoint, config);

  if (response.headers.get("content-type") === "application/pdf") {
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

if (data?.errors?.length) {
  errorMsg = data.errors[0].message.replace("Value error, ", "");
} else if (data?.message) {
  errorMsg = data.message;
} else if (data?.detail) {
  errorMsg = data.detail;
}


  throw new Error(errorMsg);
}
  
  return data;
}

export const apiService = {
  // --- Auth & User Endpoints ---
  async login(email, password) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { user: data.user, token: data.token };
  },

  async getMe(token) {
    return apiRequest("/api/auth/me", { method: "GET" }, token);
  },

  async resetPassword(token, newPassword) {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword })
    }, token);
  },

  async registerUser(token, userData) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }, token);
  },

  async getUsers(token, page = 1) {
    return apiRequest(`/api/auth/users?page=${page}`, { method: 'GET' }, token);
  },

  async getActiveInterviewers(token) {
    return apiRequest('/api/auth/interviewers', { method: 'GET' }, token);
  },

  async updateUser(token, userId, userData) {
    return apiRequest(`/api/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }, token);
  },

  // --- Jobs Endpoints ---
  async getJobs(token, page = 1) {
    return apiRequest(`/api/jobs/?page=${page}`, { method: 'GET' }, token);
  },

  async getJobById(token, jobId) {
    return apiRequest(`/api/jobs/${jobId}`, { method: 'GET' }, token);
  },

  async createJob(token, jobData) {
    return apiRequest('/api/jobs/', {
      method: 'POST',
      body: JSON.stringify(jobData)
    }, token);
  },

  async updateJob(token, jobId, jobData) {
    return apiRequest(`/api/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    }, token);
  },

  // --- Candidates Endpoints ---
  async getCandidates(token, page = 1) {
    return apiRequest(`/api/candidates/?page=${page}`, { method: 'GET' }, token);
  },

  async getCandidateById(token, candidateId) {
    return apiRequest(`/api/candidates/${candidateId}`, { method: 'GET' }, token);
  },

  async createCandidate(token, formData) {
    // Note: options.body is FormData, header is not json
    return apiRequest('/api/candidates/', {
      method: 'POST',
      body: formData
    }, token);
  },

  async updateCandidate(token, candidateId, candidateData) {
    return apiRequest(`/api/candidates/${candidateId}`, {
      method: 'PUT',
      body: JSON.stringify(candidateData)
    }, token);
  },

  async updateCandidateStatus(token, candidateId, status) {
    return apiRequest(`/api/candidates/${candidateId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }, token);
  },

  async getCandidateHistory(token, candidateId) {
    return apiRequest(`/api/candidates/${candidateId}/history`, { method: 'GET' }, token);
  },

  async downloadResume(token, candidateId) {
    const blob = await apiRequest(`/api/candidates/${candidateId}/resume`, { method: 'GET' }, token);
    return URL.createObjectURL(blob);
  },
}  
