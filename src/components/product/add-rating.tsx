"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "../ui/toast";
import { api } from "../../api/route";
import { Card, CardContent } from "../ui/card";

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
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate this product</h3>
        
        <div className="space-y-6">
          {/* Star Rating */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">How would you rate this product?</p>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => {
                return (
                  <button
                    type="button"
                    key={star}
                    className={`transition-transform duration-100 transform hover:scale-110 ${
                      (hover || rating) >= star ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(null)}
                    disabled={isSubmitting}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                );
              })}
              <span className="ml-3 text-sm font-medium text-gray-700">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : ""}
              </span>
            </div>
          </div>

          {/* Review Input */}
          {showReviewInput && (
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="review" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Share your experience
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What did you like or dislike? What should other customers know?"
                  className="min-h-[120px] text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Your review will help other customers make better decisions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => submitRating(true)}
                  disabled={isSubmitting || !review.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors h-11"
                  size="lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}