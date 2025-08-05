import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { KEEP_ALIVE_CONFIG } from './keep-alive.config';
import {
  HealthStatus,
  PingResponse,
  MemoryUsage,
  ExternalPingResult,
  DetailedStatus
} from './types/keep-alive.types';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get health status of the server
   */
  getHealthStatus(): HealthStatus {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal
      }
    };
  }

  /**
   * Simple ping response
   */
  ping(): PingResponse {
    return {
      message: 'pong',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Self-ping to keep server alive
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async selfPing() {
    try {
      const baseUrl =
        this.configService.get<string>('APP_URL') || 'http://localhost:4000';
      const response = await axios.get(`${baseUrl}/keep-alive/ping`, {
        timeout: KEEP_ALIVE_CONFIG.TIMEOUTS.SELF_PING
      });

      this.logger.log(`Self-ping successful: ${response.status}`);
    } catch (error) {
      this.logger.error(`Self-ping failed: ${error.message}`);
    }
  }

  /**
   * Ping external services to keep server active
   * Runs every 10 minutes
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async pingExternalServices() {
    for (const url of KEEP_ALIVE_CONFIG.EXTERNAL_URLS) {
      try {
        const response = await axios.get(url, {
          timeout: KEEP_ALIVE_CONFIG.TIMEOUTS.EXTERNAL_PING
        });
        this.logger.log(
          `External ping successful: ${url} - ${response.status}`
        );
      } catch (error) {
        this.logger.warn(`External ping failed: ${url} - ${error.message}`);
      }
    }
  }

  /**
   * Database health check
   * Runs every 15 minutes
   */
  @Cron('0 */15 * * * *')
  async databaseHealthCheck() {
    try {
      // Add your database health check logic here
      // Example: await this.dataSource.query('SELECT 1');
      this.logger.log('Database health check completed');
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
    }
  }

  /**
   * Memory usage monitoring
   * Runs every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorMemoryUsage() {
    const memoryUsage = this.getMemoryUsage();
    this.logger.log(`Memory usage: ${JSON.stringify(memoryUsage)} MB`);
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsage(): MemoryUsage {
    const memoryUsage = process.memoryUsage();
    return {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };
  }

  /**
   * Ping external URL manually
   */
  async pingExternalUrl(url?: string): Promise<ExternalPingResult> {
    const targetUrl = url || 'https://httpbin.org/get';
    const startTime = Date.now();

    try {
      const response = await axios.get(targetUrl, {
        timeout: 15000
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        url: targetUrl,
        status: response.status,
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        url: targetUrl,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get detailed server status
   */
  getDetailedStatus(): DetailedStatus {
    const memoryUsage = this.getMemoryUsage();

    return {
      server: {
        uptime: process.uptime(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      memory: memoryUsage,
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
      },
      timestamp: new Date().toISOString()
    };
  }
}
