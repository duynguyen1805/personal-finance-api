# Multiple Environment Setup

Hướng dẫn setup và sử dụng multiple environments cho Personal Finance API.

## 1. Environment Files Structure

```
project/
├── .env.dev          # Development environment (local)
├── .env.prod         # Production environment (server)
├── env.dev.example   # Development environment template
├── env.prod.example  # Production environment template
└── .env              # Fallback environment file
```

## 2. Setup Environment Files

### Tạo environment files từ templates:

```bash
# Tạo development environment
npm run env:create dev

# Tạo production environment  
npm run env:create prod
```

### Validate environment files:

```bash
# Validate development environment
npm run env:validate dev

# Validate production environment
npm run env:validate prod

# Check current environment status
npm run env:status
```

## 3. Environment Variables

### Development (.env.dev)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123123
DB_DATABASE=personal-finance-dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# App Configuration
PORT=4000
NODE_ENV=development
APP_URL=http://localhost:4000

# Service Configuration
SERVICE_TYPE=MAIN_SERVICE
MODE=DEV
LOGGING=true
```

### Production (.env.prod)
```env
# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your_production_username
DB_PASSWORD=your_production_password
DB_DATABASE=personal-finance-prod

# Redis Configuration
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
REDIS_URL=redis://your-production-redis-host:6379

# App Configuration
PORT=4000
NODE_ENV=production
APP_URL=https://your-app-url.onrender.com

# Service Configuration
SERVICE_TYPE=MAIN_SERVICE
MODE=PROD
LOGGING=false
```

## 4. Running with Different Environments

### Development Mode
```bash
# Start development server (uses .env.dev)
npm run start:dev

# Start with production config locally (uses .env.prod)
npm run start:dev:prod
```

### Production Mode
```bash
# Build and start production server (uses .env.prod)
npm run start:prod
```

### Manual Environment Override
```bash
# Override NODE_ENV manually
NODE_ENV=production npm run start:dev
NODE_ENV=development npm run start:prod
```

## 5. Environment Detection

### ConfigService Logic
```typescript
// Load environment file based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.prod' : '.env.dev';

// Load .env.prod for production
// Load .env.dev for development
// Fallback to .env if specific file not found
```

### Environment Priority
1. `.env.prod` (if NODE_ENV=production)
2. `.env.dev` (if NODE_ENV=development)
3. `.env` (fallback)

## 6. Database Setup per Environment

### Development Database
```bash
# Create development database
createdb personal-finance-dev

# Run migrations for development
NODE_ENV=development npm run typeorm:migration:run

# Run seeds for development
NODE_ENV=development npm run seed:run
```

### Production Database
```bash
# Production database is managed by hosting provider
# Migrations run automatically during deployment
NODE_ENV=production npm run typeorm:migration:run
```

## 7. Deployment Configuration

### Render.com
```bash
# Build Command
npm install && npm run build

# Start Command  
NODE_ENV=production npm run start:prod

# Environment Variables (set in Render dashboard)
NODE_ENV=production
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

### Railway.app
```bash
# Environment Variables (set in Railway dashboard)
NODE_ENV=production
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database
```

## 8. Testing Different Environments

### Test Development Environment
```bash
# Start development server
npm run start:dev

# Test endpoints
curl http://localhost:4000/keep-alive/health
curl http://localhost:4000/keep-alive/ping
```

### Test Production Environment Locally
```bash
# Start with production config
npm run start:dev:prod

# Test endpoints
curl http://localhost:4000/keep-alive/health
curl http://localhost:4000/keep-alive/ping
```

## 9. Troubleshooting

### Environment File Not Found
```bash
# Check if environment file exists
ls -la .env.*

# Create missing environment file
npm run env:create dev
npm run env:create prod
```

### Wrong Environment Loaded
```bash
# Check current environment
npm run env:status

# Override NODE_ENV
NODE_ENV=production npm run start:dev
```

### Database Connection Issues
```bash
# Validate environment variables
npm run env:validate dev
npm run env:validate prod

# Check database connection
NODE_ENV=development npm run typeorm:migration:run
NODE_ENV=production npm run typeorm:migration:run
```

## 10. Best Practices

### Security
- ✅ Never commit `.env.dev` or `.env.prod` files
- ✅ Use strong passwords for production
- ✅ Rotate credentials regularly
- ✅ Use environment variables for sensitive data

### Development
- ✅ Use different databases for dev/prod
- ✅ Test with production config locally
- ✅ Validate environment files before deployment
- ✅ Use descriptive environment names

### Production
- ✅ Set NODE_ENV=production
- ✅ Use production-grade databases
- ✅ Enable SSL connections
- ✅ Monitor environment variables 