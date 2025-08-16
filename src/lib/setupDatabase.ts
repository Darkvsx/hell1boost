import { supabase } from '@/integrations/supabase/client';

export async function createReviewsTable() {
  try {
    console.log('Creating reviews table...');
    
    // Create the reviews table
    const { error: createTableError } = await supabase.rpc('create_reviews_table_if_not_exists', {});
    
    if (createTableError) {
      console.error('Error creating reviews table:', createTableError);
      return { success: false, error: createTableError.message };
    }
    
    console.log('Reviews table created successfully');
    return { success: true, message: 'Reviews table created successfully' };
    
  } catch (error) {
    console.error('Unexpected error creating reviews table:', error);
    return { success: false, error: 'Failed to create reviews table' };
  }
}

export async function setupReviewsDatabase() {
  try {
    // First, let's try to create a simple table manually using SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        order_id VARCHAR,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        customer_name VARCHAR NOT NULL,
        customer_email VARCHAR NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        purchased_item VARCHAR NOT NULL,
        purchase_value DECIMAL(10,2) NOT NULL,
        order_type VARCHAR NOT NULL,
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
      
      CREATE TABLE IF NOT EXISTS review_helpful (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(review_id, user_id)
      );
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Database setup completed successfully');
    return { success: true, message: 'Database setup completed' };
    
  } catch (error) {
    console.error('Error setting up database:', error);
    return { success: false, error: 'Failed to setup database' };
  }
}

// Alternative approach: Insert some sample data to test
export async function insertSampleReviews() {
  try {
    const sampleReviews = [
      {
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
      },
      {
        customer_name: 'Sarah K.',
        customer_email: 'sarah@example.com',
        rating: 5,
        title: 'Best boosting service I\'ve used',
        content: 'I\'ve tried other services before but this one is by far the best. The boosters are clearly skilled players and they maintained my K/D ratio while completing the missions. Worth every penny!',
        purchased_item: 'Liberation Campaign Completion',
        purchase_value: 45.00,
        order_type: 'service',
        completion_time_hours: 4.0,
        verified_purchase: true,
        helpful_count: 18,
        is_featured: false,
        is_approved: true,
      }
    ];
    
    const { error } = await supabase
      .from('reviews')
      .insert(sampleReviews);
      
    if (error) {
      console.error('Error inserting sample reviews:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, message: 'Sample reviews inserted successfully' };
    
  } catch (error) {
    console.error('Error inserting sample reviews:', error);
    return { success: false, error: 'Failed to insert sample reviews' };
  }
}
