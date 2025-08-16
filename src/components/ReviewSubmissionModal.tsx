import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useReviewSubmission } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import {
  Star,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Package,
  Timer,
  DollarSign,
} from 'lucide-react';

interface ReviewSubmissionModalProps {
  trigger?: React.ReactNode;
  orderId: string;
  orderDetails: {
    orderNumber: string;
    purchasedItem: string;
    purchaseValue: number;
    orderType: 'bundle' | 'service' | 'custom';
    completionTimeHours?: number;
    completedAt?: string;
  };
  onSuccess?: () => void;
}

export function ReviewSubmissionModal({
  trigger,
  orderId,
  orderDetails,
  onSuccess,
}: ReviewSubmissionModalProps) {
  const { user } = useAuth();
  const { submitReview, submitting, error } = useReviewSubmission();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.rating === 0) {
      errors.rating = 'Please select a rating';
    }

    if (!formData.title.trim()) {
      errors.title = 'Please enter a review title';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      errors.content = 'Please write your review';
    } else if (formData.content.length < 20) {
      errors.content = 'Review must be at least 20 characters long';
    } else if (formData.content.length > 2000) {
      errors.content = 'Review must be less than 2000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitReview({
        orderId,
        rating: formData.rating,
        title: formData.title.trim(),
        content: formData.content.trim(),
        purchasedItem: orderDetails.purchasedItem,
        purchaseValue: orderDetails.purchaseValue,
        orderType: orderDetails.orderType,
        completionTimeHours: orderDetails.completionTimeHours,
      });

      setSuccess(true);
      onSuccess?.();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setFormData({ rating: 0, title: '', content: '' });
        setFormErrors({});
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'bundle':
        return 'Bundle';
      case 'service':
        return 'Service';
      case 'custom':
        return 'Custom Order';
      default:
        return type;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  const defaultTrigger = (
    <Button className="w-full">
      <Star className="w-4 h-4 mr-2" />
      Write a Review
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Share Your Experience
          </DialogTitle>
          <DialogDescription>
            Help other helldivers by sharing your experience with this order
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Review Submitted!
            </h3>
            <p className="text-muted-foreground">
              Thank you for your feedback. Your review will help other customers make informed decisions.
            </p>
          </div>
        ) : (
          <>
            {/* Order Details */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                ORDER DETAILS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Item</p>
                    <p className="text-sm font-medium">{orderDetails.purchasedItem}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getOrderTypeLabel(orderDetails.orderType)}</Badge>
                  <span className="text-xs text-muted-foreground">
                    #{orderDetails.orderNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Value</p>
                    <p className="text-sm font-medium">${orderDetails.purchaseValue}</p>
                  </div>
                </div>
                {orderDetails.completionTimeHours && (
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed in</p>
                      <p className="text-sm font-medium">
                        {orderDetails.completionTimeHours} hours
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {orderDetails.completedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Completed on {formatDate(orderDetails.completedAt)}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Overall Rating <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <StarRating
                    rating={formData.rating}
                    readonly={false}
                    size="lg"
                    onRatingChange={(rating) => {
                      setFormData({ ...formData, rating });
                      if (formErrors.rating) {
                        setFormErrors({ ...formErrors, rating: '' });
                      }
                    }}
                  />
                  {formData.rating > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {formData.rating} out of 5 stars
                    </span>
                  )}
                </div>
                {formErrors.rating && (
                  <p className="text-sm text-destructive">{formErrors.rating}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Review Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Summarize your experience..."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) {
                      setFormErrors({ ...formErrors, title: '' });
                    }
                  }}
                  className={formErrors.title ? 'border-destructive' : ''}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formErrors.title || 'Write a concise, helpful title'}</span>
                  <span>{formData.title.length}/200</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Your Review <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Share details about your experience, what went well, and any areas for improvement..."
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                    if (formErrors.content) {
                      setFormErrors({ ...formErrors, content: '' });
                    }
                  }}
                  className={`min-h-[120px] ${formErrors.content ? 'border-destructive' : ''}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formErrors.content || 'Be specific and helpful to other customers'}</span>
                  <span>{formData.content.length}/2000</span>
                </div>
              </div>

              {/* Submission Guidelines */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Review Guidelines
                </h5>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Be honest and fair in your assessment</li>
                  <li>• Focus on your actual experience with the service</li>
                  <li>• Avoid personal attacks or inappropriate language</li>
                  <li>• Include specific details that would help other customers</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || formData.rating === 0}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
