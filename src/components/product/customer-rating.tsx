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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Global Rating Summary */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
              <p className="text-sm text-gray-500 mt-1">Share your experience to help others</p>
            </div>
            {!showAddReview && (
              <Button 
                size="lg"
                onClick={() => setShowAddReview(true)}
                disabled={!!userReview}
                className="w-full sm:w-auto transition-colors"
              >
                {userReview ? 'Your Review Submitted' : 'Write a Review'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center sm:text-left">
              <div className="text-4xl font-bold text-gray-900">
                {reviews.length > 0 
                  ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'}
                <span className="text-gray-400 text-2xl">/5</span>
              </div>
              <div className="flex justify-center sm:justify-start mt-1">
                {renderStars(reviews.length > 0 
                  ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
                  : 0
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="w-full sm:w-auto flex-1 max-w-md">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => Math.round(r.rating) === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium w-8 text-gray-700">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
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
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">Your Review</h3>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(userReview.rating)}
                  <span className="text-sm text-gray-500 ml-2">
                    {format(new Date(userReview.updatedAt), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => setShowAddReview(true)}
                className="text-blue-600 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {userReview.review && (
              <p className="text-gray-700">
                {userReview.review}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Reviews ({reviews.length})
              </h3>
              <div className="text-sm text-gray-500">
                Sorted by: <span className="font-medium">Most recent</span>
              </div>
            </div>
            
            {reviews
              .filter(review => !userReview || review.id !== userReview.id)
              .map((review) => (
                <Card key={review.id} className="border border-gray-100 hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-500 ml-1">
                                {format(new Date(review.updatedAt), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.review && (
                          <p className="mt-3 text-gray-700 leading-relaxed">
                            {review.review}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
            <p className="mt-1 text-gray-500 max-w-md mx-auto">
              Be the first to share your experience with this product.
            </p>
            <Button 
              onClick={() => setShowAddReview(true)}
              className="mt-4"
            >
              Write a Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}