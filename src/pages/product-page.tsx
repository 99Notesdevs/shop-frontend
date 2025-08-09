import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiHeart, FiShare2, FiMinus, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { api } from '../api/route';
import { useAuth } from '../contexts/AuthContext';
import { CartSidebar } from '../components/ui/cart-sidebar';
import toast from 'react-hot-toast';
import { env } from '../config/env';
import { RelatedProducts } from '../components/product/related-product';
import { Breadcrumb } from '../components/ui/breadcrumb';
import ProductHighlights from '../components/product/product-highlights';
import CustomerRating from '../components/product/customer-rating';
import ServiceIcon from '../components/common/service-icon';
import StarRating from '../components/ui/StarRating';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number; 
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
        productId: [product.id],
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
        amount: product.price * quantity,
        validity: 10,
        quantity: quantity,
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
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add to wishlist');
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  
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
        setIsCartOpen(true); // Open the cart sidebar after adding item
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
    <>
      <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        

        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb  />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Product Images */}
              <div className="lg:w-1/2">
                <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                  <div className="relative w-full pt-[133.33%]">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <img 
                        src={images[currentImage]} 
                        alt={product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
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
                   <StarRating 
                     productId={product.id} 
                     userId={currentUser?.id } 
                     interactive={!!currentUser}
                   />
                  </div>
                </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{product.salePrice?.toFixed(2)}</span>
                <span className="ml-2 text-base text-gray-500 line-through">₹{(product.price?.toFixed(2))}</span>
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                </span>
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
              <div className="pt-4 border-t border-gray-200">
              <ProductHighlights />
              <ServiceIcon />
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
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

          {/* Customer Rating */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <CustomerRating />
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
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default ProductPage;