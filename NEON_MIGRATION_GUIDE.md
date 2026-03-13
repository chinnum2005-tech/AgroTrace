# Neon Database Migration Guide

## Overview
This project has been configured to use **Neon Serverless Postgres** instead of local PostgreSQL.

## What Changed

### ✅ Updated Files
- `.env` - Root environment file
- `apps/backend/.env` - Backend environment
- `packages/prisma/.env` - Prisma environment  
- `.env.example` - Example template
- `docker-compose.yml` - Removed local PostgreSQL service

### 📋 Configuration Changes
All environment files now use the Neon connection string format:
```
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/agritrace?sslmode=require"
```

**Note:** The `?sslmode=require` parameter is important for Neon connections!

---

## Migration Steps

### 1️⃣ Create Your Neon Database

1. Go to [Neon Console](https://console.neon.io/)
2. Sign up or log in
3. Click **"New Project"**
4. Enter a project name (e.g., "FarmConnect")
5. Choose a region closest to you
6. Click **"Create Project"**

### 2️⃣ Get Connection String

After creating your project:

1. In the Neon dashboard, find your database
2. Click **"Connection Details"**
3. Copy the **connection string** (looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/agritrace?sslmode=require
   ```

### 3️⃣ Update Environment Files

Replace the placeholder values in all `.env` files with your actual Neon connection string:

**Files to update:**
- `.env` (line 4)
- `apps/backend/.env` (line 4)
- `packages/prisma/.env` (line 4)

Example:
```env
DATABASE_URL="postgresql://farmconnect_user:abc123xyz@ep-cozy-sunset-123456.us-east-2.aws.neon.tech/agritrace?sslmode=require"
POSTGRES_USER="farmconnect_user"
POSTGRES_PASSWORD="abc123xyz"
POSTGRES_DB="agritrace"
```

### 4️⃣ Run Database Migrations

With your Neon connection configured:

```bash
# Navigate to prisma package
cd packages/prisma

# Generate Prisma Client
npx prisma generate

# Push schema to Neon database
npx prisma db push

# OR run migrations
npx prisma migrate dev
```

### 5️⃣ Seed the Database (Optional)

```bash
# From packages/prisma directory
npx prisma db seed
```

### 6️⃣ Start the Application

Since we removed the local PostgreSQL from docker-compose:

```bash
# Start backend and frontend only
docker-compose up backend web ai-service
```

Or start services individually:

```bash
# Backend
cd apps/backend
npm run dev

# Frontend
cd apps/web
npm run dev
```

---

## Important Notes

### 🔒 SSL Mode Required
Neon requires SSL connections. Make sure your connection string includes:
```
?sslmode=require
```

### 🌐 Connection Pooling
Neon uses serverless architecture. For production:
- Consider using **PgBouncer** for connection pooling
- Set appropriate pool size limits
- Monitor connection usage

### 🔄 No Local Database Needed
With Neon:
- ✅ No need to run Docker PostgreSQL container
- ✅ No local data persistence concerns
- ✅ Instant database provisioning
- ✅ Automatic backups and scaling

### 🛠️ Prisma Compatibility
Neon is fully compatible with Prisma. All operations work normally:
- `prisma migrate`
- `prisma db push`
- `prisma studio`
- `prisma generate`

---

## Troubleshooting

### Connection Issues

**Error:** `SSL connection required`
- ✅ Add `?sslmode=require` to your DATABASE_URL

**Error:** `Database not found`
- ✅ Verify database name exists in Neon console
- ✅ Check connection string is correct

**Error:** `Authentication failed`
- ✅ Verify username and password are correct
- ✅ Check for special characters in password (URL encode if needed)

### Migration Issues

If you have existing data in local PostgreSQL that you want to migrate:

1. Export from local PostgreSQL:
   ```bash
   pg_dump -U postgres -h localhost agritrace > backup.sql
   ```

2. Import to Neon:
   ```bash
   psql "your-neon-connection-string" < backup.sql
   ```

Or use Prisma to recreate schema:
```bash
npx prisma migrate reset
```

---

## Production Deployment

For production environments:

1. Use production-grade connection strings
2. Store secrets securely (AWS Secrets Manager, etc.)
3. Configure connection pooling
4. Set up monitoring and alerts
5. Enable automatic backups

---

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/database/neon)
- [Neon GitHub](https://github.com/neondatabase/neon)

---

**Need Help?** Check the Neon docs or reach out to the team!
