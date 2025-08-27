import { useEffect, useState } from 'react';
import { api } from '../../api/route';
import { FaStar } from 'react-icons/fa';

interface StarRatingProps {
  productId: number;
  readonly?: boolean;
}

const StarRating = ({ productId}: StarRatingProps) => {
  const [rating, setRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalRating = async () => {
      try {
        const response = await api.get(`/productRating/global/${productId}`) as { 
          success: boolean; 
          data: number;
          count?: number;
        };
        if (response.success) {
          setRating(response.data || 0);
          setRatingCount(response.count || 0);
        }
      } catch (error) {
        console.error('Error fetching rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalRating();
  }, [productId]);

  if (loading) {
    return <div className="animate-pulse">Loading rating...</div>;
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`w-5 h-5 ${
            star <= rating
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} {ratingCount > 0 && `(${ratingCount})`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
