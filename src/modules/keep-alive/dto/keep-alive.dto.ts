import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class HealthStatusDto {
  @ApiProperty({ example: 'ok', description: 'Server status' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Current timestamp' })
  timestamp: string;

  @ApiProperty({ example: 3600, description: 'Server uptime in seconds' })
  uptime: number;

  @ApiProperty({
    description: 'Memory usage information',
    example: {
      used: 1024000,
      total: 2048000,
    },
  })
  memory: {
    used: number;
    total: number;
  };
}

export class PingResponseDto {
  @ApiProperty({ example: 'pong', description: 'Ping response message' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Current timestamp' })
  timestamp: string;
}

export class ExternalPingDto {
  @ApiProperty({ 
    example: 'https://httpbin.org/get', 
    description: 'External URL to ping',
    required: false 
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;
}

export class MemoryUsageDto {
  @ApiProperty({ example: 150, description: 'RSS memory usage in MB' })
  rss: number;

  @ApiProperty({ example: 100, description: 'Heap used memory in MB' })
  heapUsed: number;

  @ApiProperty({ example: 200, description: 'Heap total memory in MB' })
  heapTotal: number;

  @ApiProperty({ example: 50, description: 'External memory usage in MB' })
  external: number;
} 