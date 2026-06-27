const API_URL = 'http://localhost:5000/api';

/**
 * Helper for authenticated API requests
 * @param path The API endpoint path (e.g. '/users/profile')
 * @param options Fetch options
 * @returns Parsed JSON response
 */
export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('tefli_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ ما أثناء الاتصال بالخادم.');
  }
  return data;
};
