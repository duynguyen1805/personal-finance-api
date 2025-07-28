export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}

export interface PingResponse {
  message: string;
  timestamp: string;
}

export interface MemoryUsage {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export interface ExternalPingResult {
  success: boolean;
  url: string;
  status?: number;
  responseTime?: number;
  error?: string;
  timestamp: string;
}

export interface DetailedStatus {
  server: {
    uptime: number;
    version: string;
    environment: string;
  };
  memory: MemoryUsage;
  process: {
    pid: number;
    platform: string;
    nodeVersion: string;
  };
  timestamp: string;
} 