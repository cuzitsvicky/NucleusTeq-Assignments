const API_BASE_URL = 'http://localhost:8000';

/**
 * Centralized fetch helper that handles request options, basic authorization injection,
 * and parses response as JSON or returns custom validation errors.
 */
async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Basic ${token}`;
  }
  
  // Do not set Content-Type header if sending FormData (browser handles it automatically with boundaries)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers
  };
  
  const response = await fetch(url, config);
  
  // Handle file download response
  if (response.headers.get('content-type') === 'application/pdf') {
    return response.blob();
  }
  
  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    // If not json response
  }
  
  if (!response.ok) {
    // Standard error structure mapped from backend Centralized Exception Handler
    const errorMsg = data?.detail 
      ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
      : `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  
  return data;
}

export const apiService = {
  // --- Auth & User Endpoints ---
  async login(email, password) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return { user: data.user, token: data.token };
  },

  async getMe(token) {
    return apiRequest('/api/auth/me', { method: 'GET' }, token);
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
  }

}  