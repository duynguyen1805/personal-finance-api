# Deployment Guide for Personal Finance API (NestJS Backend)

This guide provides a step-by-step process to deploy the Personal Finance API backend to a server. It includes command examples, explanations, and important notes to ensure a smooth deployment.

---

## 1. Prerequisites

Before you begin, ensure your server has the following installed:

- **Node.js** (v20+ recommended - 20.18.1)
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose** (for containerized deployment)
- **Git** (for cloning the repository)
- **Database** (e.g., MySQL/PostgreSQL, as required by your project)

> **Note:** You may need `sudo` privileges for some commands.

---

## 2. Clone the Repository

```bash
git clone https://github.com/your-username/personal-finance-api.git
cd personal-finance-api
```
**Explanation:**
- `git clone ...` downloads the project code from your repository.
- `cd ...` moves into the project directory.

---

## 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp docs/env.example .env
   ```
2. Edit `.env` and update values for your server/database/email/etc.
   ```bash
   nano .env
   ```
   > **Note:** Ensure all required variables are set (DB credentials, JWT secrets, etc.).

---

## 4. Install Dependencies (If Not Using Docker)

```bash
npm install
```
**Explanation:** Installs all Node.js dependencies listed in `package.json`.

---

## 5. Build the Project

```bash
npm run build
```
**Explanation:** Compiles TypeScript source code into JavaScript in the `dist/` folder.

---

## 6. Database Migration

Run database migrations to set up tables:
```bash
npm run typeorm:migration:run
```
**Explanation:** Applies all pending TypeORM migrations to your database.

---

## 7. (Optional) Seed Initial Data

If you need to seed initial data:
```bash
npm run seed:run
```
**Explanation:** Runs the seeding scripts to populate the database with initial data.

---

## 8. Start the Application

### a. With Node.js
```bash
npm run start:prod
```
**Explanation:** Starts the NestJS app in production mode.

### b. With Docker

1. **Build Docker Image:**
   ```bash
   docker build -t personal-finance-api .
   ```
   **Explanation:** Builds a Docker image named `personal-finance-api` from the Dockerfile.

2. **Run Docker Container:**
   ```bash
   docker run -d --name pf-api -p 3000:3000 --env-file .env personal-finance-api
   ```
   **Explanation:**
   - `-d`: Run in detached mode (in the background)
   - `--name pf-api`: Name the container
   - `-p 3000:3000`: Map host port 3000 to container port 3000
   - `--env-file .env`: Pass environment variables

> **Note:** Adjust the port if your app uses a different one.

---

## 9. Verify Deployment

- Access the API at `http://your-server-ip:3000/`
- Check logs:
  ```bash
  docker logs pf-api
  # or if running with Node.js
  tail -f logs/your-log-file.log
  ```

---

## 10. Common Issues & Notes

- **Port Conflicts:** Ensure port 3000 (or your configured port) is open and not used by another service.
- **Database Connection Errors:** Double-check your `.env` DB settings and that the DB server is running and accessible.
- **File Permissions:** Some environments may require adjusting permissions for logs, uploads, etc.
- **Environment Variables:** Never commit `.env` files with secrets to version control.
- **Docker Build Issues:** If you get network or permission errors, try running with `sudo` or check Docker daemon status.
- **Migrations/Seeds:** Always back up your database before running migrations or seeds in production.
- **Security:**
  - Use strong secrets for JWT and other sensitive configs.
  - Restrict access to your server and database.
  - Keep dependencies up to date.

---

## 11. Useful Commands

- **Stop Docker Container:**
  ```bash
  docker stop pf-api
  ```
- **Remove Docker Container:**
  ```bash
  docker rm pf-api
  ```
- **Rebuild Docker Image:**
  ```bash
  docker build --no-cache -t personal-finance-api .
  ```

---

## 12. Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)

---

# End of Guide 