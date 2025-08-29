"use client";

import { useEffect, useState } from "react";
import { Star, StarHalf, Edit } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { format } from "date-fns";
import StarRating from "../../components/ui/StarRating";
import AddRating from "./add-rating";
import { api } from "../../api/route";

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  review?: string;
  user: {
    id: number;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CustomerRating({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch all reviews
      const reviewsRes = await api.get(`productRating/reviews/${productId}`) as { success: boolean; data: Review[] };
      
      if (reviewsRes.success) {
        setReviews(reviewsRes.data);
      }

      // Fetch user's review if logged in
      try {
        const userReviewRes = await api.get(`/productRating/review/${productId}`) as { success: boolean; data: Review }; 
        
        if (userReviewRes.success) {
          if (userReviewRes.data) {
            setUserReview(userReviewRes.data);
          }
        } else {
          console.error("Error fetching user review:", userReviewRes.data);
        }
      } catch (error) {
        console.error("Error in user review fetch:", error);
      }
    } catch (error) {
      console.error("Error in fetchReviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewSubmit = () => {
    setShowAddReview(false);
    fetchReviews(); // Refresh the reviews after submission
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Global Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Customer Reviews</CardTitle>
            {!showAddReview && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddReview(true)}
                disabled={!!userReview}
              >
                {userReview ? 'Your Review Submitted' : 'Write a Review'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <StarRating productId={productId} readonly />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Review Form */}
      {showAddReview && (
        <AddRating 
          productId={productId} 
          onRatingSubmitted={handleReviewSubmit}
        />
      )}

      {/* User's Review */}
      {userReview && !showAddReview && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Review</h3>
              <Button 
                onClick={() => setShowAddReview(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 mb-2">
              {renderStars(userReview.rating)}
              <span className="text-sm text-muted-foreground ml-2">
                {format(new Date(userReview.updatedAt), "MMM d, yyyy")}
              </span>
            </div>
            {userReview.review && (
              <p className="text-muted-foreground">
                {userReview.review}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {reviews.length > 0 ? (
          reviews
            .filter(review => !userReview || review.id !== userReview.id)
            .map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{review.user.name}</h4>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-muted-foreground ml-1">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.review && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.review}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}