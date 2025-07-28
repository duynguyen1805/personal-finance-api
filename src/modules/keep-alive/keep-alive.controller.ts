import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Body
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KeepAliveService } from './keep-alive.service';
import {
  HealthStatusDto,
  PingResponseDto,
  ExternalPingDto,
  MemoryUsageDto
} from './dto/keep-alive.dto';
import { ExternalPingResult, DetailedStatus } from './types/keep-alive.types';

@ApiTags('Keep Alive')
@Controller('keep-alive')
export class KeepAliveController {
  constructor(private readonly keepAliveService: KeepAliveService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Server is alive and running',
    type: HealthStatusDto
  })
  async healthCheck(): Promise<HealthStatusDto> {
    return this.keepAliveService.getHealthStatus();
  }

  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simple ping endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    type: PingResponseDto
  })
  async ping(): Promise<PingResponseDto> {
    return this.keepAliveService.ping();
  }

  @Get('memory')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get memory usage information' })
  @ApiResponse({
    status: 200,
    description: 'Memory usage information',
    type: MemoryUsageDto
  })
  async getMemoryUsage(): Promise<MemoryUsageDto> {
    return this.keepAliveService.getMemoryUsage();
  }

  @Post('external-ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ping external URL manually' })
  @ApiResponse({
    status: 200,
    description: 'External ping result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        url: { type: 'string' },
        status: { type: 'number' },
        responseTime: { type: 'number' },
        timestamp: { type: 'string' }
      }
    }
  })
  async pingExternalUrl(@Body() externalPingDto: ExternalPingDto): Promise<ExternalPingResult> {
    return this.keepAliveService.pingExternalUrl(externalPingDto.url);
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get detailed server status' })
  @ApiResponse({
    status: 200,
    description: 'Detailed server status',
    schema: {
      type: 'object',
      properties: {
        server: { type: 'object' },
        memory: { type: 'object' },
        process: { type: 'object' },
        timestamp: { type: 'string' }
      }
    }
  })
  async getDetailedStatus(): Promise<DetailedStatus> {
    return this.keepAliveService.getDetailedStatus();
  }
}
