import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      return { success: false, error: 'Connection failed', details: connectionError };
    }
    
    console.log('Basic connection successful');
    
    // Test reviews table existence
    const { data: reviewsTest, error: reviewsError } = await supabase
      .from('reviews')
      .select('count')
      .limit(1);
    
    if (reviewsError) {
      console.error('Reviews table test failed:', reviewsError);
      return { 
        success: false, 
        error: 'Reviews table does not exist', 
        details: reviewsError,
        needsSchema: true 
      };
    }
    
    console.log('Reviews table exists and is accessible');
    return { success: true, message: 'All tests passed' };
    
  } catch (error) {
    console.error('Unexpected error during Supabase test:', error);
    return { success: false, error: 'Unexpected error', details: error };
  }
}
