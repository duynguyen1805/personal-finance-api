# Detailed Deployment Guide - Docker + VPS + GitHub Actions CI/CD

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Setup](#docker-setup)
4. [VPS Server Setup](#vps-server-setup)
5. [GitHub Actions CI/CD](#github-actions-cicd)
6. [Deployment Process](#deployment-process)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software & Accounts:
- **GitHub Account** - để lưu trữ code và setup CI/CD
- **VPS Server** (Ubuntu 20.04+ recommended)
- **Domain Name** (optional, nhưng recommended)
- **Docker Hub Account** (optional, để push images)

### Local Machine Requirements:
- **Git** - để clone/push code
- **Docker Desktop** - để test Docker locally
- **Code Editor** (VS Code recommended)
- **Terminal/SSH Client**

---

## Local Development Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/personal-finance-api.git
cd personal-finance-api
```

**Giải thích:** 
- Clone code từ GitHub về máy local
- Di chuyển vào thư mục project

### Step 2: Environment Configuration
```bash
# Copy environment template
cp docs/env.example .env

# Edit environment file
nano .env
```

**Cấu hình cần thiết trong .env:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=personal_finance_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (if using caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Giải thích:**
- File `.env` chứa tất cả biến môi trường cần thiết
- Mỗi biến có mục đích cụ thể (DB, JWT, Email, etc.)
- Không bao giờ commit file `.env` lên Git

### Step 3: Test Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

**Giải thích:**
- `npm install`: Cài đặt tất cả dependencies từ package.json
- `npm run start:dev`: Khởi động server development với hot reload

**Expected Output:**
```
[Nest] 1234   - MM/DD/YYYY, HH:mm:ss AM   [NestFactory] Starting Nest application...
[Nest] 1234   - MM/DD/YYYY, HH:mm:ss AM   [InstanceLoader] AppModule dependencies initialized
[Nest] 1234   - MM/DD/YYYY, HH:mm:ss AM   [RoutesResolver] AppController {/}
[Nest] 1234   - MM/DD/YYYY, HH:mm:ss AM   [RouterExplorer] Mapped {/, GET} route
[Nest] 1234   - MM/DD/YYYY, HH:mm:ss AM   [NestApplication] Nest application successfully started
```

---

## Docker Setup

### Step 1: Understanding Dockerfile
Hãy xem file `Dockerfile` hiện tại:

```dockerfile
FROM node:20.18.1-alpine as build

WORKDIR /app

# Copying source files
COPY . .

RUN apk --no-cache \
  add --update \
  git \
  openssh-client

RUN npm install -f

# Build dependencies
RUN apk --no-cache --virtual build-dependencies add \
  make \
  g++ \
  && npm run build \
  && apk del build-dependencies

# Running the app
CMD [ "npm", "start" ]
```

**Giải thích từng bước:**
1. `FROM node:20.18.1-alpine`: Sử dụng Node.js 20.18.1 với Alpine Linux (nhẹ)
2. `WORKDIR /app`: Tạo và set thư mục làm việc trong container
3. `COPY . .`: Copy toàn bộ source code vào container
4. `RUN apk add...`: Cài đặt git và openssh-client (cần cho npm install)
5. `RUN npm install -f`: Cài đặt dependencies
6. `RUN apk add build-dependencies...`: Cài đặt tools build, build project, xóa build tools
7. `CMD [ "npm", "start" ]`: Lệnh mặc định khi chạy container

### Step 2: Test Docker Locally
```bash
# Build Docker image
docker build -t personal-finance-api:latest .

# Test run locally
docker run -d --name pf-api-test -p 3000:3000 --env-file .env personal-finance-api:latest

# Check if container is running
docker ps

# Check logs
docker logs pf-api-test

# Stop and remove test container
docker stop pf-api-test
docker rm pf-api-test
```

**Giải thích:**
- `docker build`: Tạo image từ Dockerfile
- `docker run`: Chạy container từ image
- `-d`: Chạy ở background (detached mode)
- `-p 3000:3000`: Map port 3000 của host với port 3000 của container
- `--env-file .env`: Truyền biến môi trường từ file .env

### Step 3: Create Docker Compose (Optional)
Tạo file `docker-compose.yml` để dễ quản lý:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mysql
      - redis
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: personal_finance_db
      MYSQL_USER: dbuser
      MYSQL_PASSWORD: dbpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  mysql_data:
```

**Sử dụng Docker Compose:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

---

## VPS Server Setup

### Step 1: Connect to VPS
```bash
# Connect via SSH
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y
```

### Step 2: Install Required Software
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt install git -y

# Install Nginx (for reverse proxy)
apt install nginx -y

# Install Certbot (for SSL certificates)
apt install certbot python3-certbot-nginx -y
```

**Giải thích:**
- Docker: Để chạy containers
- Docker Compose: Để quản lý multiple containers
- Git: Để clone code từ GitHub
- Nginx: Làm reverse proxy và load balancer
- Certbot: Tự động tạo SSL certificates

### Step 3: Create Application Directory
```bash
# Create directory for application
mkdir -p /var/www/personal-finance-api
cd /var/www/personal-finance-api

# Set proper permissions
chown -R $USER:$USER /var/www/personal-finance-api
```

### Step 4: Setup Environment Variables
```bash
# Create environment file
nano .env
```

**Production .env example:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=prod_db_user
DB_PASSWORD=strong_production_password
DB_DATABASE=personal_finance_prod

# JWT Configuration
JWT_SECRET=your-super-secret-production-jwt-key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
CORS_ORIGIN=https://yourdomain.com
```

### Step 5: Setup Nginx Reverse Proxy
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/personal-finance-api
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/personal-finance-api /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 6: Setup SSL Certificate
```bash
# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

---

## GitHub Actions CI/CD

### Step 1: Create GitHub Secrets
Vào GitHub repository → Settings → Secrets and variables → Actions

**Thêm các secrets:**
- `VPS_HOST`: IP address của VPS
- `VPS_USERNAME`: Username để SSH (thường là root)
- `VPS_PRIVATE_KEY`: Private SSH key
- `DOCKER_HUB_USERNAME`: Docker Hub username (nếu dùng)
- `DOCKER_HUB_PASSWORD`: Docker Hub password (nếu dùng)

### Step 2: Create GitHub Actions Workflow
Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_PRIVATE_KEY }}
        script: |
          cd /var/www/personal-finance-api
          git pull origin main
          docker-compose down
          docker-compose build --no-cache
          docker-compose up -d
          docker system prune -f
```

**Giải thích workflow:**
1. **Trigger**: Chạy khi push vào branch main hoặc tạo pull request
2. **Test Job**: 
   - Checkout code
   - Setup Node.js 20
   - Install dependencies
   - Run tests
   - Build application
3. **Deploy Job** (chỉ chạy trên main branch):
   - SSH vào VPS
   - Pull code mới nhất
   - Stop containers cũ
   - Build containers mới
   - Start containers
   - Cleanup Docker cache

### Step 3: Setup SSH Key Authentication
```bash
# Generate SSH key pair (on local machine)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to VPS
ssh-copy-id root@your-server-ip

# Test SSH connection
ssh root@your-server-ip
```

---

## Deployment Process

### Step 1: Initial Deployment
```bash
# On VPS
cd /var/www/personal-finance-api

# Clone repository
git clone https://github.com/your-username/personal-finance-api.git .

# Create .env file
cp docs/env.example .env
nano .env  # Edit with production values

# Start with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f app
```

### Step 2: Database Setup
```bash
# Run migrations
docker-compose exec app npm run typeorm:migration:run

# Run seeds (if needed)
docker-compose exec app npm run seed:run
```

### Step 3: Verify Deployment
```bash
# Check if application is running
curl http://localhost:3000

# Check Nginx
curl http://yourdomain.com

# Check SSL
curl https://yourdomain.com
```

---

## Monitoring & Maintenance

### Step 1: Setup Logging
```bash
# View application logs
docker-compose logs -f app

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Setup log rotation
nano /etc/logrotate.d/personal-finance-api
```

### Step 2: Setup Monitoring
```bash
# Install monitoring tools
apt install htop iotop nethogs -y

# Monitor system resources
htop
df -h
free -h
```

### Step 3: Backup Strategy
```bash
# Create backup script
nano /root/backup.sh
```

**Backup script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec mysql mysqldump -u root -prootpassword personal_finance_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/personal-finance-api

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make script executable
chmod +x /root/backup.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup.sh
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Container Won't Start
```bash
# Check container logs
docker-compose logs app

# Check if port is already in use
netstat -tulpn | grep :3000

# Restart containers
docker-compose restart
```

#### 2. Database Connection Issues
```bash
# Check if database is running
docker-compose ps mysql

# Check database logs
docker-compose logs mysql

# Test database connection
docker-compose exec app npm run typeorm:migration:run
```

#### 3. Nginx Issues
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificates
certbot renew

# Check SSL configuration
openssl s_client -connect yourdomain.com:443
```

#### 5. Memory Issues
```bash
# Check memory usage
free -h

# Check Docker disk usage
docker system df

# Clean up Docker
docker system prune -a
```

### Performance Optimization

#### 1. Docker Optimization
```dockerfile
# Multi-stage build for smaller image
FROM node:20.18.1-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20.18.1-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

#### 2. Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Add to server block
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### 3. Application Optimization
```javascript
// Add to main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

---

## Summary

### Deployment Checklist:
- [ ] VPS server setup with Docker
- [ ] Environment variables configured
- [ ] Nginx reverse proxy setup
- [ ] SSL certificate installed
- [ ] GitHub Actions workflow created
- [ ] SSH key authentication setup
- [ ] Initial deployment completed
- [ ] Database migrations run
- [ ] Monitoring and backup configured
- [ ] Performance optimization applied

### Regular Maintenance:
- [ ] Update system packages monthly
- [ ] Renew SSL certificates (automatic)
- [ ] Monitor disk space and logs
- [ ] Backup database daily
- [ ] Update application dependencies
- [ ] Monitor application performance

This detailed guide ensures a robust, scalable deployment with proper monitoring and maintenance procedures. 