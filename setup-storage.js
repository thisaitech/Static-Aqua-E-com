const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  try {
    console.log('Setting up storage bucket for banner images...');

    // Create storage bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const imagesBucket = buckets.find(bucket => bucket.name === 'images');

    if (!imagesBucket) {
      const { data, error } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });

      if (error) {
        console.error('Error creating storage bucket:', error);
        return;
      }

      console.log('✓ Storage bucket "images" created successfully');
    } else {
      console.log('✓ Storage bucket "images" already exists');
    }

    // Set up RLS policies for the storage bucket
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Allow public read access to images
        CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
          FOR SELECT USING (bucket_id = 'images');

        -- Allow authenticated users to upload images
        CREATE POLICY IF NOT EXISTS "Authenticated users can upload images" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

        -- Allow authenticated users to update images
        CREATE POLICY IF NOT EXISTS "Authenticated users can update images" ON storage.objects
          FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

        -- Allow authenticated users to delete images
        CREATE POLICY IF NOT EXISTS "Authenticated users can delete images" ON storage.objects
          FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
      `
    });

    if (policyError) {
      console.error('Error setting storage policies:', policyError);
    } else {
      console.log('✓ Storage policies configured');
    }

    console.log('\n🎉 Storage setup completed successfully!');
    console.log('You can now upload banner images through the admin panel');

  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage();