import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  SortDesc
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

interface Review {
  id: string;
  customerName: string;
  customerInitials: string;
  rating: number;
  title: string;
  content: string;
  orderType: "Bundle" | "Service" | "Custom";
  purchasedItem: string;
  purchaseValue: number;
  completionTime: string;
  verifiedPurchase: boolean;
  helpful: number;
  date: string;
  orderNumber: string;
  tags: string[];
}

// Mock reviews data - in real app this would come from your database
const mockReviews: Review[] = [
  {
    id: "1",
    customerName: "Alex M.",
    customerInitials: "AM",
    rating: 5,
    title: "Outstanding service! Got my account maxed super fast",
    content: "The team was incredibly professional and efficient. They completed my level boost in just 6 hours when they estimated 8-12. Communication was excellent throughout the process and they even threw in some extra stratagem unlocks. Definitely recommend!",
    orderType: "Bundle",
    purchasedItem: "Elite Helldiver Bundle",
    purchaseValue: 89.99,
    completionTime: "6 hours",
    verifiedPurchase: true,
    helpful: 24,
    date: "2025-01-15",
    orderNumber: "HD-2025-1234",
    tags: ["Fast Delivery", "Great Communication", "Bonus Content"]
  },
  {
    id: "2",
    customerName: "Sarah K.",
    customerInitials: "SK",
    rating: 5,
    title: "Best boosting service I've used",
    content: "I've tried other services before but this one is by far the best. The boosters are clearly skilled players and they maintained my K/D ratio while completing the missions. Worth every penny!",
    orderType: "Service",
    purchasedItem: "Liberation Campaign Completion",
    purchaseValue: 45.00,
    completionTime: "4 hours",
    verifiedPurchase: true,
    helpful: 18,
    date: "2025-01-14",
    orderNumber: "HD-2025-1189",
    tags: ["Skilled Team", "K/D Maintained", "Value for Money"]
  },
  {
    id: "3",
    customerName: "Mike R.",
    customerInitials: "MR",
    rating: 4,
    title: "Great results, minor delay but excellent quality",
    content: "The service took a bit longer than expected due to server issues, but the team kept me updated throughout. The final result was exactly what I wanted - all my mission objectives completed with bonus samples collected.",
    orderType: "Custom",
    purchasedItem: "Custom Mission Package",
    purchaseValue: 65.50,
    completionTime: "10 hours",
    verifiedPurchase: true,
    helpful: 12,
    date: "2025-01-13",
    orderNumber: "HD-2025-1156",
    tags: ["Good Communication", "Bonus Samples", "Delayed but Quality"]
  },
  {
    id: "4",
    customerName: "Emily T.",
    customerInitials: "ET",
    rating: 5,
    title: "Incredible attention to detail",
    content: "Not only did they complete all my objectives, but they also optimized my loadout and gave me strategic tips for future missions. The personal touch really sets them apart from other services.",
    orderType: "Bundle",
    purchasedItem: "Super Earth Elite Package",
    purchaseValue: 129.99,
    completionTime: "8 hours",
    verifiedPurchase: true,
    helpful: 31,
    date: "2025-01-12",
    orderNumber: "HD-2025-1098",
    tags: ["Loadout Optimization", "Strategic Tips", "Personal Touch"]
  },
  {
    id: "5",
    customerName: "David L.",
    customerInitials: "DL",
    rating: 5,
    title: "Exceeded expectations completely",
    content: "I ordered a simple level boost but they went above and beyond. Completed extra side missions, unlocked rare stratagems I didn't even know about, and left detailed notes about the best strategies. 10/10 would use again!",
    orderType: "Service",
    purchasedItem: "Level 50 Power Boost",
    purchaseValue: 39.99,
    completionTime: "5 hours",
    verifiedPurchase: true,
    helpful: 27,
    date: "2025-01-11",
    orderNumber: "HD-2025-1034",
    tags: ["Above and Beyond", "Rare Unlocks", "Detailed Notes"]
  },
  {
    id: "6",
    customerName: "Jessica W.",
    customerInitials: "JW",
    rating: 4,
    title: "Solid service with room for improvement",
    content: "The boosting was completed as promised and the final result was good. Communication could have been better during the middle phase, but they made up for it with faster completion than expected.",
    orderType: "Service",
    purchasedItem: "Difficulty 9 Campaign Clear",
    purchaseValue: 75.00,
    completionTime: "7 hours",
    verifiedPurchase: true,
    helpful: 9,
    date: "2025-01-10",
    orderNumber: "HD-2025-0987",
    tags: ["Fast Completion", "Good Results", "Communication"]
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(mockReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;
  const threeStarCount = reviews.filter(r => r.rating === 3).length;
  const twoStarCount = reviews.filter(r => r.rating === 2).length;
  const oneStarCount = reviews.filter(r => r.rating === 1).length;

  useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.purchasedItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(review => review.rating === parseInt(ratingFilter));
    }

    // Order type filter
    if (orderTypeFilter !== "all") {
      filtered = filtered.filter(review => review.orderType === orderTypeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest-rated":
          return b.rating - a.rating;
        case "lowest-rated":
          return a.rating - b.rating;
        case "most-helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [searchQuery, ratingFilter, orderTypeFilter, sortBy, reviews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingPercentage = (rating: number) => {
    const count = reviews.filter(r => r.rating === rating).length;
    return Math.round((count / totalReviews) * 100);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <div className="flex items-center mt-2">
                      <span className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
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
                    <p className="text-3xl font-bold text-foreground mt-2">{totalReviews}</p>
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
                    <p className="text-3xl font-bold text-foreground mt-2">{Math.round((fiveStarCount / totalReviews) * 100)}%</p>
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

          {/* Rating Breakdown */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length;
                  const percentage = (count / totalReviews) * 100;
                  
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
                      <SelectItem value="Bundle">Bundle</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
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
              Showing {filteredReviews.length} of {totalReviews} reviews
            </p>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Customer Info */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {review.customerInitials}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{review.customerName}</h4>
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
                              {review.orderType}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">{review.title}</h3>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(review.date)}
                          </div>
                          <div className="text-xs">#{review.orderNumber}</div>
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
                              <p className="text-sm font-medium">{review.purchasedItem}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Completed in</p>
                              <p className="text-sm font-medium">{review.completionTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Order Value</p>
                              <p className="text-sm font-medium">${review.purchaseValue}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {review.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button (placeholder for pagination) */}
          {filteredReviews.length === totalReviews && totalReviews > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                <SortDesc className="w-4 h-4 mr-2" />
                Load More Reviews
              </Button>
            </div>
          )}

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
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
            </div>
          )}
        </div>
      </div>
    </>
  );
}
