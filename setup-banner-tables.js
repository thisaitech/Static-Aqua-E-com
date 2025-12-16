const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.log('URL:', supabaseUrl);
  console.log('Key available:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  try {
    console.log('Creating hero_banners table...');
    
    const { error: bannerTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create hero_banners table
        CREATE TABLE IF NOT EXISTS hero_banners (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          subtitle TEXT,
          badge_text TEXT,
          button_text TEXT NOT NULL DEFAULT 'Shop Now',
          button_link TEXT NOT NULL DEFAULT '/',
          desktop_image TEXT,
          mobile_image TEXT,
          bg_color TEXT NOT NULL DEFAULT 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
          is_active BOOLEAN NOT NULL DEFAULT true,
          display_order INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (bannerTableError) {
      console.error('Error creating hero_banners table:', bannerTableError);
    } else {
      console.log('✓ hero_banners table created successfully');
    }

    console.log('Creating banner_icons table...');
    
    const { error: iconTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create banner_icons table
        CREATE TABLE IF NOT EXISTS banner_icons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          icon_name TEXT NOT NULL,
          icon_type TEXT NOT NULL CHECK (icon_type IN ('category', 'page', 'url')),
          link_value TEXT NOT NULL,
          display_name TEXT NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT true,
          display_order INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (iconTableError) {
      console.error('Error creating banner_icons table:', iconTableError);
    } else {
      console.log('✓ banner_icons table created successfully');
    }

    console.log('Adding RLS policies...');
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
        ALTER TABLE banner_icons ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    } else {
      console.log('✓ RLS enabled');
    }

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Anyone can view active banners" ON hero_banners;
        DROP POLICY IF EXISTS "Anyone can view active icons" ON banner_icons;
        DROP POLICY IF EXISTS "Authenticated users can manage banners" ON hero_banners;
        DROP POLICY IF EXISTS "Authenticated users can manage icons" ON banner_icons;
        
        -- Create new policies
        CREATE POLICY "Anyone can view active banners" ON hero_banners
          FOR SELECT USING (is_active = true);

        CREATE POLICY "Anyone can view active icons" ON banner_icons
          FOR SELECT USING (is_active = true);

        CREATE POLICY "Authenticated users can manage banners" ON hero_banners
          FOR ALL USING (auth.role() = 'authenticated');

        CREATE POLICY "Authenticated users can manage icons" ON banner_icons
          FOR ALL USING (auth.role() = 'authenticated');
      `
    });

    if (policyError) {
      console.error('Error creating RLS policies:', policyError);
    } else {
      console.log('✓ RLS policies created');
    }

    console.log('Creating indexes...');
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_hero_banners_active_order ON hero_banners (is_active, display_order);
        CREATE INDEX IF NOT EXISTS idx_banner_icons_active_order ON banner_icons (is_active, display_order);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✓ Indexes created');
    }

    console.log('Inserting default data...');

    // Insert default hero banners
    const { error: bannerInsertError } = await supabase
      .from('hero_banners')
      .upsert([
        {
          id: '1',
          title: 'Premium Aquarium Collections',
          subtitle: 'Discover our curated selection of high-quality fish tanks and aquatic accessories',
          badge_text: 'NEW ARRIVALS',
          button_text: 'Explore Tanks',
          button_link: '/category/fish-tanks',
          bg_color: 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
          display_order: 1
        },
        {
          id: '2',
          title: 'Exotic Birds Paradise',
          subtitle: 'Beautiful birds and complete care supplies for your feathered friends',
          badge_text: 'BEST SELLERS',
          button_text: 'Shop Birds',
          button_link: '/category/fancy-birds',
          bg_color: 'from-emerald-900/95 via-emerald-800/90 to-emerald-900/80',
          display_order: 2
        },
        {
          id: '3',
          title: 'Professional Equipment',
          subtitle: 'Top-grade aquatic and avian equipment from trusted brands',
          badge_text: 'PREMIUM QUALITY',
          button_text: 'View Equipment',
          button_link: '/category/equipment',
          bg_color: 'from-purple-900/95 via-purple-800/90 to-purple-900/80',
          display_order: 3
        }
      ]);

    if (bannerInsertError) {
      console.error('Error inserting banner data:', bannerInsertError);
    } else {
      console.log('✓ Default banner data inserted');
    }

    // Insert default banner icons
    const { error: iconInsertError } = await supabase
      .from('banner_icons')
      .upsert([
        {
          id: '1',
          icon_name: 'Leaf',
          icon_type: 'category',
          link_value: 'live-plants',
          display_name: 'ADA Plants',
          display_order: 1
        },
        {
          id: '2',
          icon_name: 'Fish',
          icon_type: 'category',
          link_value: 'live-fish',
          display_name: 'Live Fish',
          display_order: 2
        },
        {
          id: '3',
          icon_name: 'Zap',
          icon_type: 'category',
          link_value: 'co2-lighting',
          display_name: 'Equipment',
          display_order: 3
        }
      ]);

    if (iconInsertError) {
      console.error('Error inserting icon data:', iconInsertError);
    } else {
      console.log('✓ Default icon data inserted');
    }

    console.log('\n🎉 Banner tables setup completed successfully!');
    console.log('You can now manage hero banners from the admin panel at /admin/banners');

  } catch (error) {
    console.error('Error setting up banner tables:', error);
    process.exit(1);
  }
}

createTables();