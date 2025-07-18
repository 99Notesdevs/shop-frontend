import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiHeart, FiShare2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaPinterest, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { api } from '../api/route';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { env } from '../config/env';

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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const handleBuyNow = async () => {
    const token = Cookies.get("token");
    const data = {
      orderDate: new Date().toISOString(),
      totalAmount: 1200,
      status: "Pending",
      billingAddress: "",
      shippingAddress: "",
    };
    const response = await fetch(`${env.API}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (response.status === 403) {
      alert('Please login to continue');
      window.location.href = '/users/login';
      return;
    }
    const responseData = await response.json();
    console.log("First ", responseData);
    const orderId = responseData.data.id;
    const orderData = {
      orderId: orderId,
      phonepe_transactionId: "",
      status: "",
      amount: data.totalAmount,
      redirectUrl: "",
      validity: 10
    }
    const response2 = await fetch(`${env.API}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const responseData2 = await response2.json();
    console.log(responseData2.data);
    const redirectUrl = responseData2.redirectUrl;
    window.location.href = redirectUrl;
  };
    

  const addToWishlist = async (productId: number) => {
    if (!currentUser) {
      toast.error('Please sign in to add items to your wishlist');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      const response = await fetch(`${env.API}/wishlist/${productId}/1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
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

  const handleAddToCart = async () => {
    if (!product) return;
    
    const token = Cookies.get("token");
    if (!token) {
      toast.error('Please login to add items to cart');
      navigate('/users/login');
      return;
    }

    try {
      const response = await fetch(`${env.API}/cart/1?productId=${product.id}&quantity=${quantity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast.error('Please login to continue');
        navigate('/users/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart');
      }

      const data = await response.json();
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
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)]">
      <Helmet>
        <title>{product.name} - 99Notes</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 mb-8">
          <ol className="flex space-x-2">
            <li>Home</li>
            <li>/</li>
            <li>Books</li>
            <li>/</li>
            <li>History</li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Images */}
            <div className="md:w-1/2">
              <div className="relative bg-white p-4 rounded-lg shadow-sm">
                <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={images[currentImage]} 
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  <button 
                    className="absolute top-1/2 left-2 bg-white p-2 rounded-full shadow-md transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    className="absolute top-1/2 right-2 bg-white p-2 rounded-full shadow-md transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                  <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <FiMaximize2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex mt-4 space-x-2">
                  {images.map((img, index) => (
                    <button 
                      key={index}
                      className={`w-16 h-16 rounded overflow-hidden border-2 ${currentImage === index ? 'border-orange-500' : 'border-transparent'}`}
                      onClick={() => setCurrentImage(index)}
                    >
                      <img 
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <p className="text-2xl font-bold text-gray-900 mb-6">₹{product.price.toFixed(2)}</p>

              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <button 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 w-12 text-center">{quantity}</span>
                  <button 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock || 1)}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 mt-2">In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-sm text-red-600 mt-2">Currently out of stock</p>
              )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button onClick={handleAddToCart} className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md transition-colors">
                  ADD TO CART
                </button>
                <button onClick={handleBuyNow} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 px-6 rounded-md transition-colors">
                  BUY NOW
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`flex items-center justify-center p-2 rounded-full ${
                    isInWishlist 
                      ? 'text-red-500 hover:bg-red-50' 
                      : 'text-gray-400 hover:bg-gray-100'
                  } transition-colors duration-200`}
                  title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlistLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                  ) : (
                    <FiHeart 
                      className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`} 
                    />
                  )}
                </button>
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <FiShare2 className="mr-2" />
                  <span>Compare</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <span className="text-gray-700 w-24">Categories:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.category?.name || 'No category'}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Share:</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-500 hover:text-blue-600">
                    <FaFacebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-blue-400">
                    <FaTwitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-red-600">
                    <FaPinterest className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-blue-700">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-gray-700">
                    <FaEnvelope className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description - Moved below */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
            <div className="prose max-w-none mb-8">
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
      </main>
    </div>
  );
};

export default ProductPage;