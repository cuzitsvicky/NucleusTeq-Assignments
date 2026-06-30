async function apiRequest(endpoint, options = {}, token = null) {
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Basic ${token}`;
  }
  
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    ...options,
    headers
  };
  
  const response = await fetch(endpoint, config);
  
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
  }
}  