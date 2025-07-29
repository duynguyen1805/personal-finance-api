export const KEEP_ALIVE_CONFIG = {
  // External URLs to ping for keeping server active
  EXTERNAL_URLS: [
    'https://httpbin.org/get',
    'https://jsonplaceholder.typicode.com/posts/1',
    'https://api.github.com/zen'
  ],

  // Ping intervals (in minutes)
  INTERVALS: {
    SELF_PING: 5, // Self-ping every 5 minutes
    EXTERNAL_PING: 10, // External ping every 10 minutes
    DB_CHECK: 15, // Database check every 15 minutes
    MEMORY_MONITOR: 30 // Memory monitoring every 30 minutes
  },

  // Timeout settings (in milliseconds)
  TIMEOUTS: {
    SELF_PING: 10000, // 10 seconds
    EXTERNAL_PING: 15000, // 15 seconds
    DB_CHECK: 5000 // 5 seconds
  },

  // Memory thresholds (in MB)
  MEMORY_THRESHOLDS: {
    WARNING: 500, // Warning when memory usage > 500MB
    CRITICAL: 1000 // Critical when memory usage > 1GB
  },

  // Health check settings
  HEALTH_CHECK: {
    ENABLED: true,
    ENDPOINT: '/keep-alive/health',
    RESPONSE_TIME_THRESHOLD: 5000 // 5 seconds
  }
} as const;
