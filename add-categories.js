const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://cqghbwmzxpuwxqnjvzhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZ2hid216eHB1d3hxbmp2emhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjU4NjUsImV4cCI6MjA4MTM0MTg2NX0.lVBZuIyZreEFNPez_WS49NTu703DotDvNYigkQcxN0M';
const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  {
    name: 'Fish Tanks',
    is_active: true,
    show_in_hero: true,
    types: ['2 Feet Tanks', '3 Feet Tanks', '4 Feet Tanks', 'Ultra Clear Tanks'],
    display_order: 1
  },
  {
    name: 'Live Plants',
    is_active: true,
    show_in_hero: true,
    types: ['Tissue Culture', 'Potted Plants', 'Carpeting Plants', 'Background Plants'],
    display_order: 2
  },
  {
    name: 'Fancy Birds',
    is_active: true,
    show_in_hero: true,
    types: ['Lovebirds', 'Cockatiels', 'Conures', 'Budgerigars'],
    display_order: 3
  },
  {
    name: 'Equipment',
    is_active: true,
    show_in_hero: true,
    types: ['Air Pumps', 'Filters', 'CO2 Systems', 'Lighting', 'Heaters'],
    display_order: 4
  },
  {
    name: 'Live Fish',
    is_active: true,
    show_in_hero: false,
    types: ['Tropical Fish', 'Goldfish', 'Betta Fish', 'Cichlids'],
    display_order: 5
  },
  {
    name: 'Bird Supplies',

    is_active: true,
    show_in_hero: false,
    types: ['Food', 'Cages', 'Toys', 'Perches'],
    display_order: 6
  },
  {
    name: 'Foods & Medicines',

    is_active: true,
    show_in_hero: false,
    types: ['Fish Food', 'Bird Food', 'Medicines', 'Supplements'],
    display_order: 7
  },
  {
    name: 'Tank Accessories & Spares',

    is_active: true,
    show_in_hero: false,
    types: ['Substrates', 'Decorations', 'Spare Parts', 'Cleaning Supplies'],
    display_order: 8
  },
  {
    name: 'Accessories',

    is_active: true,
    show_in_hero: false,
    types: ['Nets', 'Tubes', 'Tools', 'Test Kits'],
    display_order: 9
  }
];

async function addCategories() {
  try {
    // First, delete existing categories to avoid duplicates
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a non-existent ID

    if (deleteError) {
      console.log('Note: No existing categories to delete or delete failed:', deleteError.message);
    }

    // Insert new categories
    const { data, error } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (error) {
      console.error('Error inserting categories:', error);
      return;
    }

    console.log('Categories added successfully:', data);
    console.log(`Added ${data.length} categories to Supabase`);
  } catch (err) {
    console.error('Script error:', err);
  }
}

addCategories();