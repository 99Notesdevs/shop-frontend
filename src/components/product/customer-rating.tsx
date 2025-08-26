import { useEffect, useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Star as StarOutline } from 'lucide-react';
import { api } from '../../api/route';

interface CustomerRatingProps {
  productId: number;
}

const CustomerRating = ({ productId }: CustomerRatingProps) => {
  const [overallRating, setOverallRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    try {
      // Get global rating - no auth required
      const globalResponse = await api.get(`/productRating/global/${productId}`) as { success: boolean; data: { averageRating: number } };
      if (globalResponse.success) {
        setOverallRating(globalResponse.data.averageRating);
      }

      // Get user's rating - requires auth
      const userRatingResponse = await api.get(`/productRating/user/${productId}`) as { success: boolean; data: { rating: number } };
      if (userRatingResponse.success) {
        setUserRating(userRatingResponse.data.rating);
      }

      // Get user's review - requires auth
      const userReviewResponse = await api.get(`/productRating/review/${productId}`) as { success: boolean; data: { review: string } };
      if (userReviewResponse.success) {
        setUserReview(userReviewResponse.data.review);
      }

      // Get all reviews - requires auth
      const reviewsResponse = await api.get(`/productRating/reviews/${productId}`) as { success: boolean; data:any };
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data.reviews);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    try {
      if (userRating) {
        // Update existing rating
        const response = await api.put(`/productRating/${productId}`, { rating }) as { success: boolean };
        if (response.success) {
          await fetchData();
        }
      } else {
        // Create new rating
        const response = await api.post(`/productRating/${productId}`, { rating }) as { success: boolean };
        if (response.success) {
          await fetchData();
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/productRating/${productId}`, { review: userReview }) as { success: boolean };
      if (response.success) {
        await fetchData();
        setShowReviewForm(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      // If user hasn't rated before, create new rating
      if (!userRating) {
        const ratingResponse = await api.post(`/productRating/${productId}`, {
          rating: newRating
        }) as { success: boolean };

        if (ratingResponse.success && newReview) {
          // If there's a review, update it
          await api.put(`/productRating/${productId}`, {
            review: newReview
          });
        }
      } else {
        // Update existing rating
        await api.put(`/productRating/${productId}`, {
          rating: newRating,
          review: newReview
        });
      }

      // Refresh data
      await fetchData();
      
      // Reset form and close modal
      setNewRating(0);
      setNewReview('');
      setError('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting rating/review:', error);
      setError('Failed to submit rating/review');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
      } else {
        stars.push(<StarOutline key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      {/* Rating Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Rate & Review</h3>
            
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`text-2xl ${
                        star <= newRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Write your review here..."
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setNewRating(0);
                    setNewReview('');
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Rating Input */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Rate this product</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Rating & Review
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleReviewSubmit} className="mb-8 p-4 border rounded-lg">
          <textarea
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Write your review here..."
            required
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Overall Rating */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="text-5xl font-bold text-gray-900">
            {overallRating ? overallRating.toFixed(1) : '0.0'}
          </div>
          <div className="flex justify-center my-2">
            {renderStars(overallRating || 0)}
          </div>
          <div className="text-sm text-gray-600">Based on {reviews?.length || 0} reviews</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews && reviews.map((review: any) => (
          <div key={review?.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {review?.user?.name?.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium">{review?.user?.name || 'Anonymous'}</span>
                    {review?.user?.verified && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    {renderStars(review?.rating || 0)}
                    <span className="ml-2">
                      {review?.date ? new Date(review.date).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {review?.title && <h3 className="font-medium text-lg mt-2">{review.title}</h3>}
            {review?.comment && <p className="text-gray-700 mt-1">{review.comment}</p>}
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <span className="flex items-center mr-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {review?.likes || 0}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                {review?.dislikes || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-8 text-center">
        <button className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Load More Reviews
        </button>
      </div>
    </div>
  );
};

export default CustomerRating;