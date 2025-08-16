import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showRating?: boolean;
  className?: string;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showRating = false,
  className,
  readonly = true,
  onRatingChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleStarClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalfFilled = index < rating && index >= Math.floor(rating);
          
          return (
            <div key={index} className="relative">
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalfFilled
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-muted text-muted-foreground",
                  !readonly && "cursor-pointer hover:scale-110"
                )}
                onClick={() => handleStarClick(index)}
              />
            </div>
          );
        })}
      </div>
      {showRating && (
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
