# Database Setup Guide

Hướng dẫn cài đặt và cấu hình database cho Personal Finance API.

## 1. Local Development

### Environment Variables
Tạo file `.env` với các biến sau:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123123
DB_DATABASE=personal-finance

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# App Configuration
PORT=4000
NODE_ENV=development
```

### Setup Database
```bash
# Install dependencies
npm install

# Generate ormconfig.json from environment variables
npm run pretypeorm

# Run migrations
npm run typeorm:migration:run

# Run seeds (optional)
npm run seed:run
```

## 2. Production Deployment (Render)

### Environment Variables trên Render
Thêm các biến môi trường sau trong Render dashboard:

```env
# Database Configuration
DB_HOST=your-postgres-host.render.com
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database

# Redis Configuration (if using)
REDIS_URL=your-redis-url

# App Configuration
PORT=4000
NODE_ENV=production
APP_URL=https://your-app-url.onrender.com

# Email Configuration (if needed)
IS_SEND_EMAIL=false
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_key
```

### Build Commands trên Render
```bash
# Build Command
npm install && npm run build

# Start Command
npm run start:prod
```

### Quy trình Deploy
1. **Build Phase**: Script `prebuild` sẽ tự động chạy `npm run pretypeorm`
2. **Config Generation**: File `ormconfig.json` được tạo từ environment variables
3. **Migration**: Chạy migrations nếu cần
4. **Start**: Khởi động ứng dụng

## 3. Database Providers

### Render PostgreSQL
1. Tạo PostgreSQL service trên Render
2. Copy connection string
3. Parse thành các environment variables

### Railway PostgreSQL
1. Tạo PostgreSQL service trên Railway
2. Sử dụng connection string được cung cấp

### Supabase
1. Tạo project trên Supabase
2. Sử dụng connection string từ Settings > Database

### Neon (Serverless Postgres)
1. Tạo database trên Neon
2. Sử dụng connection string được cung cấp

## 4. Migration Management

### Tạo Migration
```bash
npm run typeorm:migration:generate -- -n MigrationName
```

### Chạy Migration
```bash
# Development
npm run typeorm:migration:run

# Production (tự động trong prestart)
npm run start:prod
```

### Revert Migration
```bash
npm run typeorm:migration:revert
```

## 5. Troubleshooting

### Lỗi Connection
1. Kiểm tra environment variables
2. Verify database credentials
3. Check network connectivity
4. Ensure database is running

### Lỗi Migration
1. Check migration files
2. Verify database schema
3. Run migrations manually if needed

### Performance Issues
1. Monitor query performance
2. Add database indexes
3. Optimize queries
4. Consider connection pooling

## 6. Security Best Practices

### Environment Variables
- ✅ Sử dụng environment variables cho sensitive data
- ✅ Không commit `.env` files
- ✅ Sử dụng strong passwords
- ✅ Rotate credentials regularly

### Database Security
- ✅ Enable SSL connections
- ✅ Use connection pooling
- ✅ Implement proper access controls
- ✅ Regular backups

### Code Security
- ✅ Validate all inputs
- ✅ Use parameterized queries
- ✅ Implement proper error handling
- ✅ Log security events 