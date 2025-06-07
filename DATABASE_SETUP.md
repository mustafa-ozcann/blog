# Database Setup for Vercel Deployment

## Problem
Getting Prisma validation error P1012 when deploying to Vercel: "the URL must start with the protocol `postgresql://` or `postgres://`"

## Current Local Configuration
Your local `.env` file is correctly formatted:
```
DATABASE_URL="postgresql://postgres:ozcan.001@db.yetdiiehoyyajhvgizhc.supabase.co:5432/postgres"
```

## Solution

### 1. Vercel Environment Variables
The issue is likely that Vercel doesn't have access to your `.env` file. You need to set environment variables in Vercel:

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add a new environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:ozcan.001@db.yetdiiehoyyajhvgizhc.supabase.co:5432/postgres`
   - **Environment**: Production (and Preview if needed)

### 2. Alternative: Use Supabase Environment Variables
If you're using Supabase, you can get the connection string from your Supabase dashboard:

1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings → Database
4. Find "Connection string" section
5. Copy the "Prisma" connection string
6. Use that exact URL in Vercel

### 3. Security Best Practices
For production, make sure to:
- Use environment-specific passwords
- Don't commit `.env` files to Git (already in your `.gitignore`)
- Use different database URLs for development and production

### 4. Testing the Fix
After setting up Vercel environment variables:
1. Redeploy your application
2. Check Vercel function logs if the error persists
3. Make sure the DATABASE_URL is exactly the same format as your local one

## Common Issues
- Missing `postgresql://` or `postgres://` prefix
- Incorrect environment variable name in Vercel
- Special characters in password not properly URL-encoded
- Environment variables not applied to the correct deployment environment 