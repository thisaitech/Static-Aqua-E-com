# 🚀 Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Step 1: Set Up Supabase (2 minutes)

1. Open https://cqghbwmzxpuwxqnjvzhh.supabase.co
2. Go to **SQL Editor**
3. Copy and paste this entire script and click **Run**:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Create admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admins" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'
    )
  );

-- Insert the admin user email
INSERT INTO admins (email)
VALUES ('nanthini@thisaitech.com');
```

### Step 2: Create Admin User (1 minute)

1. In Supabase, go to **Authentication** → **Users**
2. Click **Add User** (green button)
3. Enter:
   - **Email**: `nanthini@thisaitech.com`
   - **Password**: `Nanthini123&`
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create User**

### Step 3: Enable Email Auth (1 minute)

1. Go to **Authentication** → **Providers**
2. Click on **Email**
3. Enable **Email provider**
4. Scroll to **Site URL** and enter: `http://localhost:3000`
5. Click **Save**

### Step 4: Start Your App (30 seconds)

```bash
npm run dev
```

### Step 5: Test Everything (30 seconds)

1. Open http://localhost:3000
2. Click the **User icon** in the header
3. Login with:
   - Email: `nanthini@thisaitech.com`
   - Password: `Nanthini123&`
4. You'll be redirected to **Admin Dashboard** 🎉

## ✅ You're Done!

### What You Can Do Now:

**As Admin:**
- Access `/admin/dashboard`
- See admin controls
- Build product management features

**As User:**
- Sign up at `/register`
- Browse products
- Stay on main website after login

## 🔧 Common Issues

**Can't log in?**
- Make sure you checked "Auto Confirm User" when creating the admin
- Clear your browser cookies and try again

**"User not found"?**
- Verify the user was created in Supabase Auth
- Check the email is exactly `nanthini@thisaitech.com`

**Still having issues?**
- Check the browser console for errors
- Verify your `.env.local` file has the correct credentials

---

## 📚 Full Documentation

For complete details, see `AUTH_SETUP_README.md`

**Need help?** All authentication code is commented and follows Next.js + Supabase best practices!
