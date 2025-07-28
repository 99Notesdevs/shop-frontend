import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { api } from '../api/route';

interface StarRatingProps {
  productId: number;
  userId?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  initialRating?: number;
  size?: number;
}

export const StarRating = ({
  productId,
  userId,
  interactive = false,
  onRatingChange,
  initialRating = 0,
  size = 24,
}: StarRatingProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState<number | null>(null);
  const [globalRating, setGlobalRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Fetch global rating
        const globalRes = await api.get(`/productRating/global/${productId}`) as {success:boolean,data:number};
        if (globalRes.success && globalRes.data) {
          setGlobalRating(parseFloat(globalRes.data.toFixed(1)));
        }

        // Fetch user rating if userId is provided
        if (userId) {
          const userRes = await api.get(`/productRating/user/${productId}/${userId}`) as {success:boolean,data:number};
          if (userRes.success && userRes.data) {
            setRating(userRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [productId, userId]);

  const handleRating = async (selectedRating: number) => {
    if (!interactive || !userId) return;

    try {
      // Try to update existing rating
      await api.put(`/productRating/${productId}`, { rating: selectedRating }) as {success:boolean,data:number};
      setRating(selectedRating);
      if (onRatingChange) {
        onRatingChange(selectedRating);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  if (loading) {
    return <div className="flex">Loading ratings...</div>;
  }

  return (
    <div className="flex items-center">
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <label key={index}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => handleRating(ratingValue)}
                className="hidden"
                disabled={!interactive}
              />
              <FaStar
                className="cursor-pointer"
                color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                size={size}
                onMouseEnter={() => interactive && setHover(ratingValue)}
                onMouseLeave={() => interactive && setHover(null)}
              />
            </label>
          );
        })}
      </div>
      {globalRating !== null && (
        <span className="ml-2 text-gray-600">
          {globalRating} ({interactive ? 'Your rating' : 'Rating'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
