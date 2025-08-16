import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Star,
  Calendar,
  Package,
  Timer,
  CheckCircle2,
  Quote,
  Award,
  ThumbsUp,
  SortDesc,
  RefreshCw,
  AlertTriangle,
  Database
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useReviews, useReviewStats, useReviewHelpful } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { testSupabaseConnection } from "@/lib/testSupabase";
import { insertSampleReviews } from "@/lib/setupDatabase";
import type { Tables } from "@/integrations/supabase/types";

type Review = Tables<'reviews'>;

export default function Reviews() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { reviews, loading: reviewsLoading, error: reviewsError, refetch } = useReviews();
  const { stats, loading: statsLoading, error: statsError } = useReviewStats();
  const { toggleHelpful, loading: helpfulLoading } = useReviewHelpful();

  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [helpfulStates, setHelpfulStates] = useState<Record<string, boolean>>({});
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [showConnectionDetails, setShowConnectionDetails] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);

  // Filter and sort reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(query) ||
        review.content.toLowerCase().includes(query) ||
        review.purchased_item.toLowerCase().includes(query) ||
        review.customer_name.toLowerCase().includes(query)
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Order type filter
    if (orderTypeFilter !== "all") {
      filtered = filtered.filter(review => review.order_type === orderTypeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "oldest":
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        case "highest-rated":
          return b.rating - a.rating;
        case "lowest-rated":
          return a.rating - b.rating;
        case "most-helpful":
          return (b.helpful_count || 0) - (a.helpful_count || 0);
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, ratingFilter, orderTypeFilter, sortBy]);

  // Test Supabase connection on mount
  useEffect(() => {
    testSupabaseConnection().then(result => {
      setConnectionTest(result);
      if (!result.success) {
        console.warn('Supabase connection test failed:', result);
      }
    });
  }, []);

  // Refetch with filters
  useEffect(() => {
    const filters = {
      searchQuery: searchQuery || undefined,
      rating: ratingFilter !== "all" ? parseInt(ratingFilter) : undefined,
      orderType: orderTypeFilter !== "all" ? orderTypeFilter : undefined,
      sortBy: sortBy as any,
    };
    refetch(filters);
  }, [searchQuery, ratingFilter, orderTypeFilter, sortBy, refetch]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingPercentage = (rating: number) => {
    if (!stats) return 0;
    const count = stats.ratingBreakdown[rating] || 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'bundle':
        return 'Bundle';
      case 'service':
        return 'Service';
      case 'custom':
        return 'Custom';
      default:
        return type;
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (!user) return;

    try {
      const wasHelpful = await toggleHelpful(reviewId);
      setHelpfulStates(prev => ({
        ...prev,
        [reviewId]: wasHelpful
      }));
      // Refresh reviews to update helpful count
      refetch();
    } catch (error) {
      console.error('Error toggling helpful:', error);
    }
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (reviewsError || statsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-destructive">
            <CardContent className="p-8">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-4">Unable to Load Reviews</h1>
                <p className="text-muted-foreground mb-6">
                  {reviewsError || statsError}
                </p>

                {connectionTest && !connectionTest.success && (
                  <Alert variant="destructive" className="mb-6 text-left">
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>Database Connection Issue:</strong> {connectionTest.error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowConnectionDetails(!showConnectionDetails)}
                        >
                          {showConnectionDetails ? 'Hide' : 'Show'} Technical Details
                        </Button>
                        {showConnectionDetails && connectionTest.details && (
                          <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(connectionTest.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                  <Button variant="outline" onClick={() => {
                    testSupabaseConnection().then(setConnectionTest);
                  }}>
                    <Database className="w-4 h-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Customer Reviews - HelldiversBoost"
        description="Read honest reviews from our satisfied customers about our Helldivers 2 boosting services. See why thousands trust us with their gaming advancement."
      />
      
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-primary mr-3" />
                <h1 className="text-4xl font-bold text-foreground">Customer Reviews</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                See what our Helldivers say about their boosting experience
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Stats Overview */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                      <div className="flex items-center mt-2">
                        <span className="text-3xl font-bold text-foreground">
                          {stats.averageRating.toFixed(1)}
                        </span>
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 ml-2" />
                      </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stats.totalReviews}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {getRatingPercentage(5)}%
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Verified Purchases</p>
                      <p className="text-3xl font-bold text-foreground mt-2">100%</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rating Breakdown */}
          {stats && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingBreakdown[rating] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-8">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest-rated">Highest Rated</SelectItem>
                      <SelectItem value="lowest-rated">Lowest Rated</SelectItem>
                      <SelectItem value="most-helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </p>
          </div>

          {/* Loading State */}
          {reviewsLoading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Reviews List */}
          {!reviewsLoading && (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Customer Info */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                            {getCustomerInitials(review.customer_name)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{review.customer_name}</h4>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-muted-foreground">Verified Purchase</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <StarRating rating={review.rating} size="md" />
                              <Badge variant="outline" className="text-xs">
                                {getOrderTypeLabel(review.order_type)}
                              </Badge>
                              {review.is_featured && (
                                <Badge className="text-xs bg-primary">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{review.title}</h3>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(review.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 mb-4">
                          <Quote className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <p className="text-foreground leading-relaxed">{review.content}</p>
                        </div>

                        {/* Purchase Details */}
                        <div className="bg-muted/50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Purchased</p>
                                <p className="text-sm font-medium">{review.purchased_item}</p>
                              </div>
                            </div>
                            {review.completion_time_hours && (
                              <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Completed in</p>
                                  <p className="text-sm font-medium">{review.completion_time_hours} hours</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Order Value</p>
                                <p className="text-sm font-medium">${review.purchase_value}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleHelpfulClick(review.id)}
                            disabled={!user || helpfulLoading}
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Helpful ({review.helpful_count || 0})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!reviewsLoading && filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground">
                {reviews.length === 0 
                  ? "Be the first to leave a review!" 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {reviews.length > 0 && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setRatingFilter("all");
                    setOrderTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
