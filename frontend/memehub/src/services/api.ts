import { toast } from "sonner";

// Use environment variable for API base URL, fallback to /api for dev proxy
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  try {
    const data = isJson ? await response.json() : await response.text();
    
    if (!response.ok) {
      // Check for token expiration/unauthorized
      if (response.status === 401 || (data && typeof data === 'object' && (data.message?.toLowerCase().includes('token') || data.message?.toLowerCase().includes('unauthorized')))) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Session expired. Please log in again.');
        return;
      }
      const error = (data && data.message) || response.statusText;
      toast.error(error);
      throw new Error(error);
    }
    
    return data;
  } catch (error) {
    // Handle non-JSON responses (HTML, text, etc.)
    if (!isJson && !response.ok) {
      toast.error(`Server error: ${response.statusText}`);
      throw new Error(`Server error: ${response.statusText}`);
    }
    
    throw error;
  }
}

// Helper function for API requests
async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  // If body is FormData, do NOT set Content-Type header
  const isFormData = options.body instanceof FormData;

  const defaultHeaders: Record<string, string> = {};
  if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;
  if (!isFormData) defaultHeaders['Content-Type'] = 'application/json';

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }
    // Return empty array for GET requests to prevent map errors
    if (options.method === undefined || options.method === 'GET') {
      console.error('Error in API request:', error);
      return [];
    }
    throw error;
  }
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: any) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  postFormData: (endpoint: string, formData: FormData) => request(endpoint, {
    method: 'POST',
    headers: {},
    body: formData
  }),
  putFormData: (endpoint: string, formData: FormData) => request(endpoint, {
    method: 'PUT',
    headers: {},
    body: formData
  }),
};
