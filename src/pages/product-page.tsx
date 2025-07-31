import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiHeart, FiShare2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaPinterest, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { api } from '../api/route';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { env } from '../config/env';
import { RelatedProducts } from '../components/product/related-product';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: {
    id: number;
    name: string;
  };
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(['/placeholder-product.jpg']);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const checkWishlistStatus = useCallback(async (productId: number) => {
    if (!currentUser) {
      setIsInWishlist(false);
      return;
    }
    
    try {
      const response = await fetch(`${env.API}/wishlist/1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const wishlistProducts = data.data?.products || [];
        const isProductInWishlist = wishlistProducts.some((item: any) => item.id === productId);
        setIsInWishlist(isProductInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  }, [currentUser]);

  // Check wishlist status when product or user changes
  useEffect(() => {
    if (id && product) {
      checkWishlistStatus(parseInt(id));
    }
  }, [id, product, currentUser, checkWishlistStatus]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/product/${id}`) as { success: boolean; data: Product };
        if (data.success) {
          const productData = data.data;
          setProduct(productData);
          
          // If product has imageUrl, use it, otherwise use placeholder
          const productImages = productData.imageUrl 
            ? [productData.imageUrl] 
            : ['/placeholder-product.jpg'];
          setImages(productImages);
        } else {
          throw new Error('Failed to fetch product');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!product) {
      toast.error('Product info unavailable. Please refresh.');
      return;
    }
  
    try {
      const data = {
        orderDate: new Date().toISOString(),
        totalAmount: product.price * quantity, // include quantity
        status: "Pending",
        billingAddress: "",
        shippingAddress: "",
      };
      const response = await fetch(`${env.API}/order`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
  
      if (response.status === 403) {
        toast.error('Please login to continue');
        navigate('/users/login');
        return;
      }
  
      const responseData = await response.json();
      const orderId = responseData.data.id;
  
      const orderData = {
        orderId,
        productId: product.id,
        phonepe_transactionId: "",
        status: "",
        amount: quantity,
        validity: 10,
      };
  
      // Navigate to checkout with orderData and product info
      navigate('/checkout', { state: { orderData, product } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order. Please try again.');
    }
  };
  
    

  const addToWishlist = async (productId: number) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to your wishlist');
      navigate('/login');
      return;
    }
    console.log(product?.id);
    setWishlistLoading(true);
    try {
      const response = await fetch(`${env.API}/wishlist/${productId}/1`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to wishlist');
      }

      setIsInWishlist(true);
      toast.success('Added to wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    setWishlistLoading(true);
    try {
      const response = await fetch(`${env.API}/wishlist/${productId}/1`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from wishlist');
      }

      setIsInWishlist(false);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove from wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!id) return;
    
    if (isInWishlist) {
      await removeFromWishlist(parseInt(id));
    } else {
      await addToWishlist(parseInt(id));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const { cart, updateCart } = useAuth();
  
  // Check if the current product is in the cart
  const isProductInCart = useCallback(() => {
    if (!cart || !cart.cartItems || !product) return false;
    return cart.cartItems.some((item: any) => item.productId === product.id);
  }, [cart, product]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!cart?.id) {
      toast.error('Please login to add items to cart');
      navigate('/users/login');
      return;
    }

    try {
      const response = await fetch(`${env.API}/cart/${cart.id}?productId=${product.id}&quantity=${quantity}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Your session has expired. Please login again');
        navigate('/users/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      const data = await response.json();
      
      // Update the cart in the auth context
      if (data.data) {
        updateCart(data.data);
      }
      if (data.success) {
        toast.success('Item added to cart successfully!');
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <FiAlertCircle className="text-red-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Product</h2>
        <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Format description if it's a string
  const descriptionList = typeof product.description === 'string' 
    ? product.description.split('\n').filter(line => line.trim() !== '')
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{product.name} - 99Notes</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <main className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.history.back()}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <h1 className="text-lg font-medium text-gray-900">Product Details</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Images */}
            <div className="lg:w-1/2">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                <div className="aspect-[3/4] flex items-center justify-center">
                  <img 
                    src={images[currentImage]} 
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button 
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    onClick={prevImage}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    onClick={nextImage}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="bg-white/80 hover:bg-white p-2 rounded-full shadow-md">
                    <FiMaximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button 
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                      currentImage === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img 
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-500 text-sm ml-2">(24 reviews)</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                <span className="ml-2 text-base text-gray-500 line-through">₹{(product.price * 1.2).toFixed(2)}</span>
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">20% OFF</span>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description?.split('.')[0] || 'No description available.'}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium mr-4">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 h-10 w-10 flex items-center justify-center"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium border-l border-r border-gray-300 h-10 flex items-center justify-center">
                      {quantity}
                    </span>
                    <button 
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40 h-10 w-10 flex items-center justify-center"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (product.stock || 1)}
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="ml-3 text-sm text-gray-500">{product.stock} available</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {isProductInCart() ? (
                  <button 
                    onClick={() => navigate('/cart')} 
                    className="bg-black text-white font-medium py-3 px-6 rounded-md transition-colors"
                  >
                    GO TO CART
                  </button>
                ) : (
                <button 
                  onClick={handleAddToCart} 
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md transition-colors"
                >
                  ADD TO CART
                </button>
                )}
                <button onClick={handleBuyNow} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 px-6 rounded-md transition-colors">
                  BUY NOW
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`flex items-center space-x-2 text-sm font-medium ${
                      isInWishlist ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                    <span>Add to Wishlist</span>
                  </button>
                  <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    <FiShare2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div id="description" className="mt-12 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
              <div className="prose max-w-none">
                {descriptionList.length > 0 ? (
                  descriptionList.map((paragraph, index) => (
                    <p key={index} className="text-gray-700 mb-4">{paragraph}</p>
                  ))
                ) : (
                  <p className="text-gray-700">{product.description || 'No description available.'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <RelatedProducts 
              categoryId={product.category?.id || 0} 
              currentProductId={product.id} 
              onAddToCart={handleAddToCart} 
            />
          </div>
        </div>
      </div>
    </main>
  </div>
  );
};

export default ProductPage;