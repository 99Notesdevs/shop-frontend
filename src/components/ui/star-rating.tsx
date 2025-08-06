'use client';

import { useState, useEffect } from 'react';
import { api } from '../../api/route';
import { useAuth } from '../../contexts/AuthContext';
import { Star, StarHalf, StarOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StarRatingProps {
  productId: number;
  size?: number;
  readOnly?: boolean;
  showUserRating?: boolean;
}

export function StarRating({ 
  productId, 
  size = 20, 
  readOnly = false,
  showUserRating = true
}: StarRatingProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [globalRating, setGlobalRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's rating and global rating
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        // Fetch global rating
        const globalData = await api.get<{data: number}>(`/productRating/global/${productId}`);
        if (globalData?.data !== undefined) {
          setGlobalRating(globalData.data);
        }

        // Fetch user's rating if logged in
        if (user?.id) {
          const userData = await api.get<{data: number}>(`/productRating/user/${productId}/${user.id}`);
          if (userData?.data !== undefined) {
            setRating(userData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
        toast.error('Failed to load ratings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [productId, user?.id]);

  const handleRating = async (newRating: number) => {
    if (readOnly || !user?.id) return;
    
    try {
      const endpoint = `/productRating/${productId}`;
      
      if (rating === 0) {
        // Create new rating
        await api.post(endpoint, { rating: newRating });
        toast.success('Rating submitted!');
      } else {
        // Update existing rating
        await api.put(endpoint, { rating: newRating });
        toast.success('Rating updated!');
      }
      
      setRating(newRating);
      
      // Update global rating
      const globalData = await api.get<{data: {rating: number}}>(`/productRating/global/${productId}`);
      if (globalData?.data?.rating) {
        setGlobalRating(globalData.data.rating);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Failed to update rating');
    }
  };

  const handleDeleteRating = async () => {
    if (readOnly || !user?.id) return;
    
    try {
      await api.delete(`/productRating/${productId}`);
      setRating(0);
      toast.success('Rating removed');
      
      // Update global rating
      const globalData = await api.get<{data: {rating: number}}>(`/productRating/global/${productId}`);
      if (globalData?.data?.rating) {
        setGlobalRating(globalData.data.rating);
      } else {
        setGlobalRating(0);
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to remove rating');
    }
  };

  if (isLoading) {
    return <div className="flex">Loading ratings...</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hover || rating) >= star;
          const isHalfFilled = !isFilled && (hover || rating) > star - 1 && (hover || rating) < star;
          
          return (
            <button
              key={star}
              type="button"
              className={`p-1 ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => handleRating(star)}
              onMouseEnter={() => !readOnly && setHover(star)}
              onMouseLeave={() => !readOnly && setHover(0)}
              disabled={readOnly || !user?.id}
              title={!user?.id ? 'Please login to rate' : `Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              {isFilled ? (
                <Star className="text-yellow-400" size={size} fill="currentColor" />
              ) : isHalfFilled ? (
                <StarHalf className="text-yellow-400" size={size} fill="currentColor" />
              ) : (
                <Star className="text-gray-300" size={size} />
              )}
            </button>
          );
        })}
        
        {!readOnly && rating > 0 && (
          <button 
            onClick={handleDeleteRating}
            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove rating"
          >
            <StarOff size={size - 4} />
          </button>
        )}
      </div>
      
      {showUserRating && user?.id && rating > 0 && (
        <div className="text-sm text-gray-500">
          Your rating: {rating} star{rating > 1 ? 's' : ''}
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        Average: {globalRating.toFixed(1)} out of 5
      </div>
    </div>
  );
}

export default StarRating;