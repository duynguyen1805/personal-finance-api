# Keep Alive Setup Guide

Hướng dẫn cài đặt và cấu hình Keep Alive Module cho các nền tảng hosting free.

## 1. Environment Variables

Thêm các biến môi trường sau vào hosting platform:

```env
# App Configuration
APP_URL=https://your-app-url.com
NODE_ENV=production

# Database (nếu cần)
DATABASE_URL=your-database-url

# Redis (nếu cần)
REDIS_URL=your-redis-url
```

## 2. Platform-specific Setup

### Render.com
1. Tạo Web Service
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start:prod`
4. Thêm Environment Variables
5. Health Check Path: `/keep-alive/health`

### Railway.app
1. Connect GitHub repository
2. Auto-deploy enabled
3. Health Check URL: `https://your-app.railway.app/keep-alive/health`
4. Add environment variables

### Heroku
1. Deploy via Git
2. Add environment variables
3. Health Check: `https://your-app.herokuapp.com/keep-alive/health`

### Vercel
1. Import project
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Install Command: `npm install`
5. Health Check: `https://your-app.vercel.app/keep-alive/health`

## 3. External Monitoring Services

### UptimeRobot (Free)
1. Tạo account tại https://uptimerobot.com
2. Add New Monitor
3. Monitor Type: HTTP(s)
4. URL: `https://your-app-url.com/keep-alive/health`
5. Check Interval: 5 minutes
6. Alert When: Down

### Cron-job.org (Free)
1. Tạo account tại https://cron-job.org
2. Add New Cronjob
3. URL: `https://your-app-url.com/keep-alive/ping`
4. Schedule: `*/5 * * * *` (mỗi 5 phút)
5. Timezone: UTC

### GitHub Actions (Free)
Tạo file `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Alive
on:
  schedule:
    - cron: '*/5 * * * *'  # Mỗi 5 phút
  workflow_dispatch:  # Cho phép chạy thủ công

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping server
        run: |
          curl -X GET https://your-app-url.com/keep-alive/ping
          echo "Server pinged at $(date)"
```

## 4. Testing

### Local Testing
```bash
# Start server
npm run start:dev

# Test keep-alive endpoints
npm run test:keep-alive

# Test individual endpoints
curl http://localhost:4000/keep-alive/health
curl http://localhost:4000/keep-alive/ping
curl http://localhost:4000/keep-alive/memory
```

### Production Testing
```bash
# Test health check
curl https://your-app-url.com/keep-alive/health

# Test ping
curl https://your-app-url.com/keep-alive/ping

# Test external ping
curl -X POST https://your-app-url.com/keep-alive/external-ping \
  -H "Content-Type: application/json" \
  -d '{"url": "https://httpbin.org/get"}'
```

## 5. Monitoring Dashboard

Tạo dashboard để monitor server:

### Health Check Dashboard
```html
<!DOCTYPE html>
<html>
<head>
    <title>Server Health Monitor</title>
    <script>
        async function checkHealth() {
            try {
                const response = await fetch('/keep-alive/health');
                const data = await response.json();
                
                document.getElementById('status').textContent = data.status;
                document.getElementById('uptime').textContent = Math.round(data.uptime / 60) + ' minutes';
                document.getElementById('memory').textContent = Math.round(data.memory.used / 1024 / 1024) + 'MB';
                document.getElementById('lastCheck').textContent = new Date().toLocaleString();
                
                document.getElementById('status').className = data.status === 'ok' ? 'status-ok' : 'status-error';
            } catch (error) {
                document.getElementById('status').textContent = 'error';
                document.getElementById('status').className = 'status-error';
            }
        }
        
        // Check every 30 seconds
        setInterval(checkHealth, 30000);
        checkHealth();
    </script>
    <style>
        .status-ok { color: green; }
        .status-error { color: red; }
    </style>
</head>
<body>
    <h1>Server Health Monitor</h1>
    <p>Status: <span id="status">checking...</span></p>
    <p>Uptime: <span id="uptime">-</span></p>
    <p>Memory Used: <span id="memory">-</span></p>
    <p>Last Check: <span id="lastCheck">-</span></p>
</body>
</html>
```

## 6. Troubleshooting

### Server không respond
1. Kiểm tra logs trong hosting platform
2. Verify environment variables
3. Test endpoints manually
4. Check if scheduled tasks are running

### Memory usage cao
1. Monitor `/keep-alive/memory` endpoint
2. Check for memory leaks
3. Restart server if needed
4. Optimize code if necessary

### External ping failures
1. Check internet connectivity
2. Verify external URLs in config
3. Increase timeout settings
4. Add more reliable URLs

## 7. Best Practices

1. **Multiple Monitoring Services**: Sử dụng nhiều dịch vụ monitoring
2. **Regular Testing**: Test endpoints định kỳ
3. **Log Monitoring**: Theo dõi logs để phát hiện vấn đề
4. **Backup Plan**: Có kế hoạch dự phòng khi server down
5. **Performance Monitoring**: Theo dõi performance metrics

## 8. Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month
- **Railway**: $5 credit/month
- **Heroku**: Sleep after 30 minutes inactivity
- **Vercel**: 100GB-hours/month

### Tips to Reduce Costs
1. Use efficient scheduling
2. Monitor resource usage
3. Optimize memory usage
4. Use appropriate plan for your needs 