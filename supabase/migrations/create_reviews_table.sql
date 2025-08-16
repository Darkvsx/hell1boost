-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Order and customer info
  order_id VARCHAR REFERENCES unified_orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  
  -- Purchase details (denormalized for performance)
  purchased_item VARCHAR NOT NULL,
  purchase_value DECIMAL(10,2) NOT NULL,
  order_type VARCHAR NOT NULL, -- 'bundle', 'service', 'custom'
  completion_time_hours DECIMAL(5,1),
  
  -- Review metadata
  verified_purchase BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0,
  reported_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- Create review_helpful table for tracking which users found reviews helpful
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one vote per user per review
  UNIQUE(review_id, user_id)
);

-- Create index for review helpful
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_user_id ON review_helpful(user_id);

-- Create function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful count updates
DROP TRIGGER IF EXISTS trigger_update_review_helpful_count ON review_helpful;
CREATE TRIGGER trigger_update_review_helpful_count
  AFTER INSERT OR DELETE ON review_helpful
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can read approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews for their orders" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Review helpful policies
CREATE POLICY "Anyone can read review helpful" ON review_helpful
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can mark reviews helpful" ON review_helpful
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their helpful votes" ON review_helpful
  FOR DELETE USING (auth.uid() = user_id);

-- Add some sample reviews (optional - remove in production)
INSERT INTO reviews (
  order_id, user_id, customer_name, customer_email, rating, title, content,
  purchased_item, purchase_value, order_type, completion_time_hours,
  verified_purchase, helpful_count, is_featured
) VALUES 
(
  (SELECT id FROM unified_orders LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'user' LIMIT 1),
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
  true
) ON CONFLICT DO NOTHING;
