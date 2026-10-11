// Centralized API configuration for Nexora
// In production (Vercel), VITE_API_BASE_URL is set in the environment variables.
// In local development, it defaults to http://localhost:8080.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/$/, '')
