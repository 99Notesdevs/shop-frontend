import { useState, useEffect } from 'react';
import { Star, StarHalf, StarOutline } from '@mui/icons-material';
import { Button, Typography, Box, Avatar, Paper, TextField, Rating, Snackbar } from '@mui/material';
import { Alert as CustomAlert } from '../ui/alert';

type AlertVariant = 'default' | 'destructive';
import { api } from '../../api/route';
import { useParams } from 'react-router-dom';

interface Review {
  id: number;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface GlobalRating {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: RatingDistribution;
}

const CustomerRating = () => {
  const { productId } = useParams<{ productId: string }>();
  const [globalRating, setGlobalRating] = useState<GlobalRating | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', variant: 'default' as AlertVariant });

  const fetchGlobalRating = async () => {
    try {
      const response = await api.get(`/productRating/global/${productId}`) as { 
        success: boolean; 
        data: number; // The API returns just a number (average rating)
      };
      
      if (response.success && response.data !== undefined) {
        // Create a mock GlobalRating object with the received average rating
        const mockGlobalRating: GlobalRating = {
          averageRating: response.data,
          totalRatings: 1, // Default to 1 since we don't have this info
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        };
        
        // If we have a rating, set the corresponding distribution
        if (response.data >= 1 && response.data <= 5) {
          const roundedRating = Math.round(response.data);
          mockGlobalRating.ratingDistribution[roundedRating as keyof RatingDistribution] = 1;
        }
        
        setGlobalRating(mockGlobalRating);
      }
    } catch (error) {
      console.error('Error fetching global rating:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/productRating/reviews/${productId}`) as {
        success: boolean;
        data: Review[];
      };
      if (data) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      Promise.all([fetchGlobalRating(), fetchReviews()]);
    }
  }, [productId]);

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} sx={{ color: '#FFD700', fontSize: 20 }} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} sx={{ color: '#FFD700', fontSize: 20 }} />);
      } else {
        stars.push(<StarOutline key={i} sx={{ color: '#FFD700', fontSize: 20 }} />);
      }
    }

    return stars;
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setSnackbar({ open: true, message: 'Please select a star rating', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // First submit the rating
      await api.post(`/productRating/${productId}`, { rating });
      
      // If there's a review text, submit it as well
      if (reviewText.trim()) {
        await api.put(`/productRating/${productId}`, { review: reviewText });
      }
      
      // Refresh the data
      await Promise.all([fetchGlobalRating(), fetchReviews()]);
      
      // Reset form
      setRating(null);
      setReviewText('');
      setShowReviewForm(false);
      
      setSnackbar({ open: true, message: 'Thank you for your feedback!', variant: 'default' });
    } catch (error) {
      console.error('Error submitting rating/review:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to submit your rating/review. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Customer Reviews
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setShowReviewForm(!showReviewForm)}
          disabled={isSubmitting}
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </Box>

      {showReviewForm && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleRatingSubmit}>
            <Typography variant="h6" gutterBottom>
              Rate this product
            </Typography>
            <Box mb={2}>
              <Typography component="legend" gutterBottom>Your Rating *</Typography>
              <Rating
                name="product-rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                precision={0.5}
                size="large"
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Your Review (Optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                disabled={isSubmitting}
              />
            </Box>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting || !rating}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Paper>
      )}
      
      {globalRating && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h4" component="span" sx={{ mr: 2 }}>
              {globalRating.averageRating.toFixed(1)}
            </Typography>
            <Box>
              <Box display="flex">
                {renderStarRating(globalRating.averageRating)}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Based on {globalRating.totalRatings} reviews
              </Typography>
            </Box>
          </Box>

          <Box>
            {[5, 4, 3, 2, 1].map((star) => (
              <Box key={star} display="flex" alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ minWidth: 80 }}>
                  {star} Star
                </Typography>
                <Box sx={{ width: 200, mx: 2, bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                  <Box
                    sx={{
                      width: `${(globalRating.ratingDistribution[star as keyof RatingDistribution] / globalRating.totalRatings) * 100}%`,
                      bgcolor: '#FFD700',
                      height: '100%',
                      borderRadius: 4,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {globalRating.ratingDistribution[star as keyof RatingDistribution]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Box mb={3}>
        <Typography variant="h6">Reviews ({reviews.length})</Typography>
      </Box>

      {reviews.length === 0 ? (
        <Typography>No reviews yet. Be the first to review!</Typography>
      ) : (
        <Box>
          {reviews.map((review) => (
            <Box key={review.id} mb={3} pb={2} borderBottom="1px solid #eee">
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar src={review.user.avatar} alt={review.user.name} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1">{review.user.name}</Typography>
                  <Box display="flex" alignItems="center">
                    {renderStarRating(review.rating)}
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {showReviewForm && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleRatingSubmit}>
            <Typography variant="h6" gutterBottom>
              Write a Review
            </Typography>
            <Box mb={2}>
              <Typography>Your Rating *</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                precision={0.5}
                size="large"
              />
            </Box>
            <Box mb={2}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Your Review (Optional)"
                variant="outlined"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                disabled={isSubmitting}
              />
            </Box>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => setShowReviewForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting || !rating}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Box>
          </form>
        </Paper>
      )}
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <CustomAlert variant={snackbar.variant}>
          {snackbar.message}
        </CustomAlert>
      </Snackbar>
    </Box>
  );
};

export default CustomerRating;