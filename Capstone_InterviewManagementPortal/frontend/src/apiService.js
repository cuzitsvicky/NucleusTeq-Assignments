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
  
};
