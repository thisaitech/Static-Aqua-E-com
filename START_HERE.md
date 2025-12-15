# ✅ Setup Checklist - Complete This Before Using

## 🔴 CRITICAL: Do These Steps First

### Step 1: Set Up Supabase Database (Required)

**Go to:** https://cqghbwmzxpuwxqnjvzhh.supabase.co

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste this ENTIRE script:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Create new policies for users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Only admins can view admins" ON admins;

-- Create new policy for admins
CREATE POLICY "Only admins can view admins" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'
    )
  );

-- Insert admin email (safe if already exists due to UNIQUE constraint)
INSERT INTO admins (email)
VALUES ('nanthini@thisaitech.com')
ON CONFLICT (email) DO NOTHING;
```

4. Click **Run** (or press F5)
5. You should see "Success. No rows returned"

---

### Step 2: Create Admin User Account (Required)

**Option A: Via Supabase Dashboard (Recommended)**

1. In Supabase, go to **Authentication** → **Users** (left sidebar)
2. Click the green **Add User** button
3. Fill in:
   - **Email**: `nanthini@thisaitech.com`
   - **Password**: `Nanthini123&`
   - ✅ Check **Auto Confirm User**
4. Click **Create User**

**Option B: Via Registration Page**

1. Make sure you completed Step 1 first!
2. Start your dev server: `npm run dev`
3. Go to: http://localhost:3000/register
4. Fill in the form with:
   - Email: `nanthini@thisaitech.com`
   - Password: `Nanthini123&`
   - Other required fields
5. Submit the form

---

### Step 3: Enable Email Provider (Required)

1. In Supabase, go to **Authentication** → **Providers**
2. Find **Email** in the list
3. Toggle it to **Enabled**
4. Scroll down to **Site URL**
5. Enter: `http://localhost:3000`
6. Click **Save**

---

### Step 4: Test Admin Login (Verification)

1. Make sure dev server is running: `npm run dev`
2. Open: http://localhost:3000
3. Click the **User icon** in the header
4. Enter:
   - Email: `nanthini@thisaitech.com`
   - Password: `Nanthini123&`
5. Click **Sign In**

**✅ Expected Result:**
- You should be redirected to `/admin/dashboard`
- You should see the admin dashboard with management cards
- Header should show your email with "Admin" badge
- Top bar should show "Admin Dashboard" link

**❌ If it doesn't work:**
- Check browser console for errors
- Verify you completed Steps 1-3
- Clear browser cookies and try again
- Check that `.env.local` file exists with correct credentials

---

### Step 5: Test User Registration (Verification)

1. Sign out if logged in (click user icon → Sign Out)
2. Go to: http://localhost:3000/register
3. Fill in with a DIFFERENT email (not the admin email)
4. Submit the form

**✅ Expected Result:**
- You should stay on the homepage (not redirected to admin)
- Header should show your username
- No "Admin" badge should appear

---

## 🟢 Optional: Production Deployment

### When deploying to production:

1. **Update Supabase Settings:**
   - Go to Authentication → URL Configuration
   - Change Site URL to your production domain
   - Add your production domain to Redirect URLs

2. **Update Environment Variables:**
   - Add `.env.local` variables to your hosting platform
   - Use the same Supabase URL and anon key

3. **Test Everything Again:**
   - Test admin login on production
   - Test user registration on production
   - Verify redirects work correctly

---

## 📋 Quick Reference

### Admin Credentials
```
Email: nanthini@thisaitech.com
Password: Nanthini123&
Access: /admin/dashboard
```

### Supabase Connection
```
URL: https://cqghbwmzxpuwxqnjvzhh.supabase.co
Location: .env.local file
```

### Important URLs
```
Homepage: http://localhost:3000
Register: http://localhost:3000/register
Admin: http://localhost:3000/admin/dashboard
```

---

## 🔍 Troubleshooting

### "User not found" error
→ Go back to Step 2, create the admin user

### "Relation 'users' does not exist"
→ Go back to Step 1, run the SQL script

### "Invalid login credentials"
→ Check email/password are exactly correct (case-sensitive)

### Admin not redirecting to dashboard
→ Verify email is EXACTLY `nanthini@thisaitech.com` in admins table

### "Cannot read properties of undefined"
→ Clear browser cache and cookies, try again

### Changes not reflecting
→ Restart dev server: `npm run dev`

---

## ✅ Completion Checklist

Mark these off as you complete them:

- [ ] Step 1: Ran SQL script in Supabase ✓
- [ ] Step 2: Created admin user account ✓
- [ ] Step 3: Enabled email provider ✓
- [ ] Step 4: Successfully logged in as admin ✓
- [ ] Step 5: Successfully registered as regular user ✓

**Once all checked, you're ready to build features!** 🚀

---

## 📚 Next Steps

After completing setup:

1. Read `IMPLEMENTATION_SUMMARY.md` for feature overview
2. Read `COMPLETE_AUTH_GUIDE.md` for technical details
3. Start building admin features (product management, etc.)

---

## 🆘 Still Need Help?

**Check these files:**
- `QUICKSTART.md` - Step-by-step setup
- `SUPABASE_SETUP.md` - Database details
- `AUTH_SETUP_README.md` - Complete guide

**Common issues:**
- Make sure Node.js is updated
- Check that all npm packages installed: `npm install`
- Verify `.env.local` exists in project root
- Check Supabase project is active and accessible

---

**👉 START WITH STEP 1 ABOVE! Don't skip any steps!**
