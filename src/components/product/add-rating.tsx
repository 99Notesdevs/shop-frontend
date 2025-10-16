"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/toast";
import { api } from "../../api/route";

interface AddRatingProps {
  productId: number;
  onRatingSubmitted: () => void;
}

export default function AddRating({ productId, onRatingSubmitted }: AddRatingProps) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);
  const [review, setReview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewInput, setShowReviewInput] = useState(false);

  const handleRating = async (selectedRating: number) => {
    setRating(selectedRating);
    if (!showReviewInput) {
      setShowReviewInput(true);
    }
  };

  const submitRating = async (withReview: boolean = false) => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (withReview && !review.trim()) {
      toast.error("Please enter your review or click 'Submit Rating Only'");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // First submit the rating
      const ratingResponse = await api.put(`/productRating/${productId}`, { rating }) as { success: boolean };
      
      if (!ratingResponse.success) {
        throw new Error("Failed to submit rating");
      }

      // If review is provided, submit it separately
      if (withReview && review.trim()) {
        const reviewResponse = await api.put(`/productRating/${productId}`, { 
          review: review.trim() 
        }) as { success: boolean };
        
        if (!reviewResponse.success) {
          throw new Error("Failed to submit review");
        }
      }

      toast.success(
        withReview 
          ? "Your rating and review have been submitted!" 
          : "Your rating has been submitted!"
      );

      // Reset form
      setRating(0);
      setReview("");
      setShowReviewInput(false);
      onRatingSubmitted();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit your rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Rate this product</h3>
      
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          return (
            <button
              type="button"
              key={star}
              className={`cursor-pointer ${
                (hover || rating) >= star ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              disabled={isSubmitting}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          );
        })}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `You rated this ${rating} star${rating > 1 ? 's' : ''}` : ""}
        </span>
      </div>

      {showReviewInput && (
        <div className="space-y-4">
          <div>
            <label htmlFor="review" className="block text-sm font-medium mb-1">
              Write a review (optional)
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this product..."
              className="min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => submitRating(true)}
              disabled={isSubmitting || !review.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              variant="outline"
              onClick={() => submitRating(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating Only"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}