export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 10000,
  ENDPOINTS: {
    DONATIONS: '/api/donations',
    PROGRAMS: '/api/programs',
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
  },
} as const;
