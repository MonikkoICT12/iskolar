# Deployment Guide - Vercel + Supabase

This guide will help you deploy the Iskolar Scholarship Management System to Vercel with Supabase as the database.

## Prerequisites

1. GitHub account with the repository
2. Supabase account (free tier available)
3. Vercel account (free tier available)

## Part 1: Set Up Supabase Database

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in the details:
   - **Project name**: iskolar-palayan
   - **Database password**: (Generate a strong password and save it)
   - **Region**: Choose closest to your location (e.g., Southeast Asia)
6. Click "Create new project"
7. Wait 2-3 minutes for the database to be created

### Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `supabase-schema.sql` from this repository
4. Copy ALL the contents and paste into the SQL Editor
5. Click "Run" button (or press Ctrl+Enter)
6. You should see success messages for each table created

### Step 3: Get Supabase API Keys

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the left menu
3. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
4. Keep this page open - you'll need these values

### Step 4: (Optional) Load Sample Data

If you want to load the 100 sample scholars into Supabase:

1. Go to **SQL Editor**
2. Create a new query
3. Use this script to insert scholars (we'll create this in the next step)

## Part 2: Deploy to Vercel

### Step 1: Prepare Repository

1. Make sure all changes are committed and pushed to GitHub:
   ```bash
   git add -A
   git commit -m "Add Supabase integration"
   git push
   ```

### Step 2: Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Find and select your `iskolar` repository
5. Click "Import"

### Step 3: Configure Environment Variables

1. In the "Configure Project" screen, expand **Environment Variables**
2. Add the following variables:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: (paste your Supabase Project URL from Step 1.3)
   - Select: Production, Preview, Development

   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: (paste your Supabase anon public key from Step 1.3)
   - Select: Production, Preview, Development

   **Variable 3 (optional for local dev):**
   - Name: `VITE_ADMIN_USERNAME`
   - Value: `admin`

   **Variable 4 (optional for local dev):**
   - Name: `VITE_ADMIN_PASSWORD`
   - Value: `admin123`

3. Click "Deploy"

### Step 4: Wait for Deployment

1. Vercel will build and deploy your app (2-3 minutes)
2. Once complete, you'll see "Congratulations!"
3. Click "Visit" to open your deployed app
4. Your URL will be something like: `https://iskolar-xxx.vercel.app`

## Part 3: Test Your Deployment

### Test Admin Login

1. Visit your Vercel URL
2. Click "Admin Sign In" tab
3. Enter:
   - Username: `admin`
   - Password: `admin123`
4. You should be able to sign in and see the dashboard

### Test Adding a Scholar

1. Click "Add Scholar" button
2. Fill in all required fields including School ID (e.g., `NE-0001`)
3. Click "Add Scholar"
4. The scholar should be saved to Supabase

### Test Scholar Sign In

1. Sign out from admin
2. Click "Scholar Sign In" tab
3. Select the school you just added
4. Enter the School ID (e.g., `NE-0001`)
5. Click "Sign In"
6. You should see the scholar's read-only portal

## Part 4: Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `iskolar.palayancity.gov.ph`)
4. Follow Vercel's instructions to update DNS records
5. Wait for DNS propagation (can take up to 48 hours)

## Part 5: Load Sample Data (Optional)

To load the 100 sample scholars with School IDs:

### Option 1: Use the App UI (Recommended)

1. Sign in as admin
2. Go to "Reports" tab
3. Click "Load 100 Scholars ⭐" button
4. This will load all scholars into Supabase

### Option 2: Direct SQL Import

1. Go to Supabase SQL Editor
2. Use the provided `supabase-insert-scholars.sql` script (we'll create this)

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure you added both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables, then redeploy.

### Issue: Can't sign in

**Solution**: 
1. Check Supabase is running (green indicator in dashboard)
2. Verify environment variables are correct
3. Check browser console (F12) for error messages

### Issue: Scholars not saving

**Solution**:
1. Go to Supabase dashboard → Authentication → Policies
2. Make sure RLS policies are set correctly
3. Check the SQL Editor for any errors in the schema

### Issue: Deployment failed

**Solution**:
1. Check Vercel build logs for errors
2. Make sure all dependencies are in `package.json`
3. Try redeploying: Vercel Dashboard → Deployments → "Redeploy"

## Security Best Practices

### For Production Use:

1. **Change Default Admin Password**
   - Go to Supabase SQL Editor
   - Update the admin password hash in the `admins` table
   - Use a proper bcrypt hash generator

2. **Enable Rate Limiting**
   - Use Supabase Auth rate limiting
   - Consider adding Vercel Edge Functions for extra protection

3. **Set Up Row Level Security (RLS)**
   - Already configured in the schema
   - Review and adjust policies as needed

4. **Use Environment Variables**
   - Never commit `.env` file to GitHub
   - Manage secrets in Vercel dashboard only

5. **Enable HTTPS**
   - Automatically enabled on Vercel
   - Force HTTPS in production

## Monitoring & Maintenance

### Check App Health

1. **Vercel Analytics**: Dashboard → Your Project → Analytics
2. **Supabase Logs**: Dashboard → Logs
3. **Error Tracking**: Check Vercel Function Logs

### Backup Data

1. Go to Supabase Dashboard
2. Database → Backups
3. Enable automatic daily backups (free on Pro plan)

### Update the App

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add -A
   git commit -m "Update description"
   git push
   ```
3. Vercel automatically redeploys on every push

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Report bugs in your repository

## Cost Estimate

### Free Tier Limits:

**Vercel Free:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

**Supabase Free:**
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth

**Total Cost: $0/month** (sufficient for small to medium LGU use)

### When to Upgrade:

- More than 500 MB of scholar data
- More than 50,000 users/month
- Need phone support
- Advanced features (custom domains, etc.)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up Supabase database
3. ✅ Test all features
4. 🔜 Train LGU staff
5. 🔜 Import existing scholar data
6. 🔜 Announce to scholars

Congratulations! Your scholarship system is now live! 🎉
