# Supabase Setup Instructions

## Database Tables

You need to create the following tables in your Supabase database:

### 1. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 2. Admins Table

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies (only admins can access)
CREATE POLICY "Only admins can view admins" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'
    )
  );
```

### 3. Insert Admin User

```sql
-- Insert the admin user
INSERT INTO admins (email)
VALUES ('nanthini@thisaitech.com');
```

## Authentication Setup

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Enable **Email** provider
4. Configure email templates if needed
5. Set **Site URL** to your application URL (e.g., `http://localhost:3000` for development)
6. Add redirect URLs for authentication

## Storage Setup (Optional)

If you want to use Supabase Storage for product images:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `products`
3. Set the bucket to **Public** if you want images to be publicly accessible
4. Configure storage policies as needed

## Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://cqghbwmzxpuwxqnjvzhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZ2hid216eHB1d3hxbmp2emhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjU4NjUsImV4cCI6MjA4MTM0MTg2NX0.lVBZuIyZreEFNPez_WS49NTu703DotDvNYigkQcxN0M
```

## Testing the Authentication

### For Admin Account:
- Email: nanthini@thisaitech.com
- Password: Nanthini123&

First, you need to create this account:
1. Use the Supabase dashboard to create this user manually in **Authentication** → **Users** → **Add User**
2. Or use the sign-up functionality and then manually add the email to the admins table

### For Regular Users:
- Users can sign up through the `/register` page
- Their data will be stored in the `users` table
- They will remain on the user website after login

## Next Steps

1. Run the SQL commands above in your Supabase SQL Editor
2. Create the admin user account
3. Test the login functionality
4. Start building your admin dashboard features

## Additional Tables for E-commerce (Optional)

You might want to add these tables for a complete e-commerce solution:

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  stock INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
