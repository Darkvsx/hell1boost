import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { fallbackReviews } from '@/lib/reviewsFallback';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'>;
type ReviewInsert = Tables<'reviews'>['Insert'];
type ReviewUpdate = Tables<'reviews'>['Update'];

interface ReviewFilters {
  searchQuery?: string;
  rating?: number;
  orderType?: string;
  sortBy?: 'newest' | 'oldest' | 'highest-rated' | 'lowest-rated' | 'most-helpful';
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: Record<number, number>;
  featuredReviews: Review[];
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const fetchReviews = async (filters: ReviewFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // If we're in fallback mode, use mock data
      if (useFallback) {
        let filteredReviews = [...fallbackReviews];

        // Apply filters to fallback data
        if (filters.rating) {
          filteredReviews = filteredReviews.filter(r => r.rating === filters.rating);
        }
        if (filters.orderType) {
          filteredReviews = filteredReviews.filter(r => r.order_type === filters.orderType);
        }
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredReviews = filteredReviews.filter(r =>
            r.title.toLowerCase().includes(query) ||
            r.content.toLowerCase().includes(query) ||
            r.purchased_item.toLowerCase().includes(query) ||
            r.customer_name.toLowerCase().includes(query)
          );
        }

        // Apply sorting
        switch (filters.sortBy) {
          case 'oldest':
            filteredReviews.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
            break;
          case 'highest-rated':
            filteredReviews.sort((a, b) => b.rating - a.rating);
            break;
          case 'lowest-rated':
            filteredReviews.sort((a, b) => a.rating - b.rating);
            break;
          case 'most-helpful':
            filteredReviews.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
            break;
          default: // newest
            filteredReviews.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
        }

        setReviews(filteredReviews);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true);

      // Apply filters
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.orderType) {
        query = query.eq('order_type', filters.orderType);
      }

      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%,purchased_item.ilike.%${filters.searchQuery}%,customer_name.ilike.%${filters.searchQuery}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest-rated':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest-rated':
          query = query.order('rating', { ascending: true });
          break;
        case 'most-helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      let errorMessage = 'Failed to fetch reviews';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }

      // Check for specific Supabase errors
      if (errorMessage.includes('relation "reviews" does not exist')) {
        errorMessage = 'Reviews table not found. Please contact support to set up the database.';
      } else if (errorMessage.includes('JWT')) {
        errorMessage = 'Authentication error. Please try logging in again.';
      } else if (errorMessage.includes('permission')) {
        errorMessage = 'Permission denied. Please check your account access.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
}

export function useReviewStats() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating, is_featured')
        .eq('is_approved', true);

      if (reviewsError) throw reviewsError;

      const { data: featuredReviews, error: featuredError } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (featuredError) throw featuredError;

      if (reviews) {
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        const ratingBreakdown = reviews.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        setStats({
          totalReviews,
          averageRating,
          ratingBreakdown,
          featuredReviews: featuredReviews || [],
        });
      }
    } catch (err) {
      console.error('Error fetching review stats:', err);
      let errorMessage = 'Failed to fetch review stats';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }

      // Check for specific Supabase errors
      if (errorMessage.includes('relation "reviews" does not exist')) {
        errorMessage = 'Reviews table not found. Please contact support to set up the database.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

export function useReviewSubmission() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (reviewData: {
    orderId: string;
    rating: number;
    title: string;
    content: string;
    purchasedItem: string;
    purchaseValue: number;
    orderType: string;
    completionTimeHours?: number;
  }) => {
    if (!user) {
      throw new Error('Must be logged in to submit a review');
    }

    try {
      setSubmitting(true);
      setError(null);

      // Check if user already reviewed this order
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('order_id', reviewData.orderId)
        .eq('user_id', user.id)
        .single();

      if (existingReview) {
        throw new Error('You have already reviewed this order');
      }

      const newReview: ReviewInsert = {
        order_id: reviewData.orderId,
        user_id: user.id,
        customer_name: user.username || 'Anonymous',
        customer_email: user.email,
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
        purchased_item: reviewData.purchasedItem,
        purchase_value: reviewData.purchaseValue,
        order_type: reviewData.orderType,
        completion_time_hours: reviewData.completionTimeHours,
        verified_purchase: true,
        is_approved: true, // Auto-approve for now, you can add moderation later
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const updateReview = async (reviewId: string, updates: ReviewUpdate) => {
    if (!user) {
      throw new Error('Must be logged in to update a review');
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitReview,
    updateReview,
    submitting,
    error,
  };
}

export function useReviewHelpful() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleHelpful = async (reviewId: string) => {
    if (!user) {
      throw new Error('Must be logged in to mark reviews as helpful');
    }

    try {
      setLoading(true);

      // Check if user already marked this review as helpful
      const { data: existingVote } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Remove the helpful vote
        const { error } = await supabase
          .from('review_helpful')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;
        return false; // Removed vote
      } else {
        // Add helpful vote
        const { error } = await supabase
          .from('review_helpful')
          .insert([{
            review_id: reviewId,
            user_id: user.id,
          }]);

        if (error) throw error;
        return true; // Added vote
      }
    } catch (err) {
      console.error('Error toggling helpful vote:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUserHelpfulVote = async (reviewId: string) => {
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  return {
    toggleHelpful,
    checkUserHelpfulVote,
    loading,
  };
}

export function useUserReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReviews = async () => {
    if (!user) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch your reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserReviews();
  }, [user]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchUserReviews,
  };
}
