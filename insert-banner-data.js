const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertDefaultData() {
  try {
  

    // Insert default hero banners
    const { data: bannerData, error: bannerError } = await supabase
      .from('hero_banners')
      .upsert([
        {
          title: 'Premium Aquarium Collections',
          subtitle: 'Discover our curated selection of high-quality fish tanks and aquatic accessories',
          badge_text: 'NEW ARRIVALS',
          button_text: 'Explore Tanks',
          button_link: '/category/fish-tanks',
          bg_color: 'from-blue-900/95 via-blue-800/90 to-blue-900/80',
          display_order: 1
        },
        {
          title: 'Exotic Birds Paradise',
          subtitle: 'Beautiful birds and complete care supplies for your feathered friends',
          badge_text: 'BEST SELLERS',
          button_text: 'Shop Birds',
          button_link: '/category/fancy-birds',
          bg_color: 'from-emerald-900/95 via-emerald-800/90 to-emerald-900/80',
          display_order: 2
        },
        {
          title: 'Professional Equipment',
          subtitle: 'Top-grade aquatic and avian equipment from trusted brands',
          badge_text: 'PREMIUM QUALITY',
          button_text: 'View Equipment',
          button_link: '/category/equipment',
          bg_color: 'from-purple-900/95 via-purple-800/90 to-purple-900/80',
          display_order: 3
        }
      ], { onConflict: 'title' });

 

    // Insert default banner icons
    const { data: iconData, error: iconError } = await supabase
      .from('banner_icons')
      .upsert([
        {
          icon_name: 'Leaf',
          icon_type: 'category',
          link_value: 'live-plants',
          display_name: 'ADA Plants',
          display_order: 1
        },
        {
          icon_name: 'Fish',
          icon_type: 'category',
          link_value: 'live-fish',
          display_name: 'Live Fish',
          display_order: 2
        },
        {
          icon_name: 'Zap',
          icon_type: 'category',
          link_value: 'co2-lighting',
          display_name: 'Equipment',
          display_order: 3
        }
      ], { onConflict: 'display_name' });

    

  } catch (error) {
    console.error('Error during setup:', error);
  }
}

insertDefaultData();