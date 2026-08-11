export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const IS_MOCK_MODE = !API_BASE_URL || import.meta.env.VITE_MOCK_MODE === 'true';

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (IS_MOCK_MODE) {
    throw new Error('API not available in mock mode');
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
