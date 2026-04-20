/**
 * Layer 4 - API Service
 * This layer is responsible for making actual fetch requests to the backend.
 * Access is restricted to Server-side environments.
 */

export const apiService = {
  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = process.env.BACKEND_URL;
    if (!baseUrl) {
      throw new Error('BACKEND_URL is not defined in environment variables');
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Request failed with status ${response.status}`);
    }

    return response.json();
  },

  async post<T>(path: string, data: unknown, options: RequestInit = {}): Promise<T> {
    const baseUrl = process.env.BACKEND_URL;
    if (!baseUrl) {
      throw new Error('BACKEND_URL is not defined in environment variables');
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Request failed with status ${response.status}`);
    }

    return response.json();
  },
};
