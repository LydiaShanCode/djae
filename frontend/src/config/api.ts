/**
 * API Configuration
 * Centralizes backend URL configuration from environment variables
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      token: '/api/v1/auth/token',
    },
    playback: {
      transfer: '/api/v1/playback/transfer',
      play: '/api/v1/playback/play',
    },
    playlists: {
      import: '/api/v1/playlists/import',
    },
  },
} as const;

/**
 * Helper function to build full API URLs
 */
export const getApiUrl = (path: string): string => {
  return `${API_CONFIG.baseURL}${path}`;
};