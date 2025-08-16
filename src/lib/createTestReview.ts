import { supabase } from '@/integrations/supabase/client';

export async function createReviewsTableAndAddTestData() {
  try {
    console.log('Creating reviews table and adding test data...');
    
    // First, let's try to create the table using SQL
    const createTableSQL = `
      -- Create reviews table
      CREATE TABLE IF NOT EXISTS public.reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id TEXT,
        user_id UUID,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        purchased_item TEXT NOT NULL,
        purchase_value DECIMAL(10,2) NOT NULL,
        order_type TEXT NOT NULL,
        completion_time_hours DECIMAL(5,1),
        verified_purchase BOOLEAN DEFAULT TRUE,
        helpful_count INTEGER DEFAULT 0,
        reported_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT TRUE,
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

      -- Create policy to allow everyone to read approved reviews
      CREATE POLICY IF NOT EXISTS "Anyone can read approved reviews" ON public.reviews
        FOR SELECT USING (is_approved = true);

      -- Insert one test review
      INSERT INTO public.reviews (
        customer_name, customer_email, rating, title, content,
        purchased_item, purchase_value, order_type, completion_time_hours,
        verified_purchase, helpful_count, is_featured, is_approved
      ) VALUES (
        'Alex M.',
        'alex@example.com',
        5,
        'Outstanding service! Got my account maxed super fast',
        'The team was incredibly professional and efficient. They completed my level boost in just 6 hours when they estimated 8-12. Communication was excellent throughout the process and they even threw in some extra stratagem unlocks. Definitely recommend!',
        'Elite Helldiver Bundle',
        89.99,
        'bundle',
        6.0,
        true,
        24,
        true,
        true
      ) ON CONFLICT DO NOTHING;
    `;

    // Try to execute the SQL via a simple insert (this will create the table via Supabase dashboard SQL editor)
    console.log('SQL to execute:');
    console.log(createTableSQL);
    
    return { 
      success: false, 
      error: 'Please run this SQL in your Supabase dashboard SQL editor',
      sql: createTableSQL
    };
    
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed to setup reviews table' };
  }
}

// Simplified function to just add a test review (assuming table exists)
export async function addTestReview() {
  try {
    const testReview = {
      customer_name: 'Alex M.',
      customer_email: 'alex@example.com',
      rating: 5,
      title: 'Outstanding service! Got my account maxed super fast',
      content: 'The team was incredibly professional and efficient. They completed my level boost in just 6 hours when they estimated 8-12. Communication was excellent throughout the process and they even threw in some extra stratagem unlocks. Definitely recommend!',
      purchased_item: 'Elite Helldiver Bundle',
      purchase_value: 89.99,
      order_type: 'bundle',
      completion_time_hours: 6.0,
      verified_purchase: true,
      helpful_count: 24,
      is_featured: true,
      is_approved: true,
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert([testReview])
      .select();

    if (error) {
      throw error;
    }

    console.log('Test review added successfully:', data);
    return { success: true, data, message: 'Test review added successfully' };
    
  } catch (error) {
    console.error('Error adding test review:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add test review' };
  }
}
