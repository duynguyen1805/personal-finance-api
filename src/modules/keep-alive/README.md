# Keep Alive Module

Module này được thiết kế để giữ cho server không bị sleep trên các nền tảng free hosting như Render, Railway, Heroku, v.v.

## Tính năng

### 1. Health Check Endpoints
- **GET** `/keep-alive/health` - Kiểm tra trạng thái server
- **GET** `/keep-alive/ping` - Ping đơn giản
- **GET** `/keep-alive/memory` - Thông tin sử dụng memory
- **GET** `/keep-alive/status` - Trạng thái chi tiết server
- **POST** `/keep-alive/external-ping` - Ping URL bên ngoài thủ công

### 2. Scheduled Tasks
- **Self-ping**: Tự động ping chính nó mỗi 5 phút
- **External ping**: Ping các dịch vụ bên ngoài mỗi 10 phút
- **Database check**: Kiểm tra database mỗi 15 phút
- **Memory monitoring**: Giám sát memory mỗi 30 phút

### 3. Cấu hình
File `keep-alive.config.ts` chứa các cấu hình:
- Danh sách URL bên ngoài để ping
- Khoảng thời gian thực hiện các task
- Timeout settings
- Memory thresholds

## Cách sử dụng

### 1. Cài đặt
Module đã được import vào `app.module.ts` và sẽ tự động hoạt động.

### 2. Cấu hình Environment Variables
```env
APP_URL=https://your-app-url.com
NODE_ENV=production
```

### 3. Sử dụng với dịch vụ bên ngoài
Bạn có thể sử dụng các dịch vụ sau để ping server:

#### UptimeRobot
- Tạo monitor với URL: `https://your-app-url.com/keep-alive/health`
- Check interval: 5 phút

#### Cron-job.org
- URL: `https://your-app-url.com/keep-alive/ping`
- Schedule: `*/5 * * * *` (mỗi 5 phút)

#### GitHub Actions
```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping server
        run: curl -X GET https://your-app-url.com/keep-alive/ping
```

## API Endpoints

### Health Check
```bash
GET /keep-alive/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 1024000,
    "total": 2048000
  }
}
```

### Ping
```bash
GET /keep-alive/ping
```
Response:
```json
{
  "message": "pong",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Memory Usage
```bash
GET /keep-alive/memory
```
Response:
```json
{
  "rss": 150,
  "heapUsed": 100,
  "heapTotal": 200,
  "external": 50
}
```

### External Ping
```bash
POST /keep-alive/external-ping
Content-Type: application/json

{
  "url": "https://httpbin.org/get"
}
```
Response:
```json
{
  "success": true,
  "url": "https://httpbin.org/get",
  "status": 200,
  "responseTime": 150,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Monitoring

### Logs
Module sẽ log các hoạt động:
- Self-ping success/failure
- External ping results
- Memory usage warnings
- Database health check results

### Memory Thresholds
- Warning: > 500MB
- Critical: > 1GB

## Troubleshooting

### Server vẫn bị sleep
1. Kiểm tra logs để đảm bảo scheduled tasks đang chạy
2. Tăng tần suất ping (thay đổi trong config)
3. Sử dụng dịch vụ bên ngoài để ping

### Memory usage cao
1. Kiểm tra `/keep-alive/memory` endpoint
2. Xem logs để tìm memory leaks
3. Restart server nếu cần thiết

### External ping failures
1. Kiểm tra internet connection
2. Thay đổi danh sách URL trong config
3. Tăng timeout settings 