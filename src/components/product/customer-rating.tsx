import type { FC } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { Star as StarOutline } from 'lucide-react';

interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rating: number;
  date: string;
  title: string;
  comment: string;
  likes: number;
  dislikes: number;
}

const CustomerRating: FC = () => {
  // Sample data - replace with your actual data source
  const overallRating = 4.5;
  const totalReviews = 152;
  const ratingDistribution = [
    { stars: 5, count: 95, percentage: 63 },
    { stars: 4, count: 35, percentage: 23 },
    { stars: 3, count: 12, percentage: 8 },
    { stars: 2, count: 5, percentage: 3 },
    { stars: 1, count: 3, percentage: 2 },
  ];

  const reviews: Review[] = [
    {
      id: 1,
      user: {
        name: 'John Doe',
        avatar: '',
        verified: true,
      },
      rating: 5,
      date: '2023-10-15',
      title: 'Amazing product!',
      comment: 'This product exceeded my expectations. The quality is outstanding and it works perfectly for my needs.',
      likes: 24,
      dislikes: 2,
    },
    {
      id: 2,
      user: {
        name: 'Jane Smith',
        avatar: '',
        verified: false,
      },
      rating: 4,
      date: '2023-10-10',
      title: 'Great value for money',
      comment: 'Very good product overall. The only reason I\'m not giving 5 stars is because the delivery was a bit late.',
      likes: 12,
      dislikes: 0,
    },
  ];

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
      
      {/* Overall Rating */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="text-5xl font-bold text-gray-900">{overallRating.toFixed(1)}</div>
          <div className="flex justify-center my-2">
            {renderStars(overallRating)}
          </div>
          <div className="text-sm text-gray-600">Based on {totalReviews} reviews</div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1">
          {ratingDistribution.map((item) => (
            <div key={item.stars} className="flex items-center mb-2">
              <div className="w-10 text-sm text-gray-600">{item.stars} stars</div>
              <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400" 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="w-10 text-right text-sm text-gray-600">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {review.user.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium">{review.user.name}</span>
                    {review.user.verified && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    {renderStars(review.rating)}
                    <span className="ml-2">{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="font-medium text-lg mt-2">{review.title}</h3>
            <p className="text-gray-700 mt-1">{review.comment}</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <span className="flex items-center mr-4">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {review.likes}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
                {review.dislikes}
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