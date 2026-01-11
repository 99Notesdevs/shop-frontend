import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiHeart, FiShare2, FiMinus, FiPlus, FiAlertCircle, FiTruck, FiShield} from 'react-icons/fi';
import { api } from '../api/route';
import { useAuth } from '../contexts/AuthContext';
import { CartSidebar } from '../components/ui/cart-sidebar';
import toast from '../components/ui/toast';
import { RelatedProducts } from '../components/product/related-product';
import ProductHighlights from '../components/product/product-highlights';
import CustomerRating from '../components/product/customer-rating';
import StarRating from '../components/ui/StarRating';
import { useUser } from '../contexts/UserContext';
import RecentlyWatched, { addToRecentlyViewed } from '../components/product/recntly-watched';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  salePrice: number; 
  stock: number;
  imageUrl: string;
  metadata?: string;
  categoryId: number;
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(['/placeholder-product.jpg']);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { user: currentUser, wishlist, updateWishlist } = useAuth();
  const isInWishlist = wishlist?.some(item => item.id === parseInt(id || '0')) || false;
  const { openUserModal } = useUser();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState('description');
  const [zoomImage, setZoomImage] = useState({ show: false, src: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/product/${id}`) as { success: boolean; data: Product };
        if (data.success) {
          const productData = data.data;
          setProduct(productData);
          
          const productImages = productData.imageUrl 
            ? productData.imageUrl
                .split(',')
                .map(url => {
                  const trimmed = url.trim();
                  return trimmed ? encodeURI(trimmed) : '';
                })
                .filter(Boolean)
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

  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        category: product.categoryId.toString(), 
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl: product.imageUrl
      });
    }
  }, [product]);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!product) {
      toast.error('Product info unavailable. Please refresh.');
      return;
    }
  
    try {
      const data = {
        orderDate: new Date().toISOString(),
        totalAmount: product.price * quantity, 
        products: [{productId:product.id,product, quantity:quantity}],
        status: "Pending",
        billingAddress: "",
        shippingAddress: "",
      };
      const response = await api.post(`/order`, data) as { success: boolean; data: any };
  
      if (!response.success) {
        toast.error('Please login to continue');
        openUserModal('login');
        return;
      }
  
      const orderId = response.data.id;
  
      const orderData = {
        orderId,
        productId: product.id,
        phonepe_transactionId: "",
        status: "",
        amount: product.price * quantity,
        validity: 10,
        quantity: quantity,
      };
  
      navigate('/checkout', { state: { orderData, product } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create order. Please try again.');
    }
  };

  const toggleWishlist = async () => {
    if (!id || !currentUser) {
      openUserModal('login');
      return;
    }
    
    try {
      setWishlistLoading(true);
      const productId = parseInt(id);
      await updateWishlist(productId, isInWishlist ? 'remove' : 'add');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
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
  
  const isProductInCart = useCallback(() => {
    if (!cart || !cart.cartItems || !product) return false;
    return cart.cartItems.some((item: any) => item.productId === product.id);
  }, [cart, product]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!cart?.id) {
      toast.error('Please login to add items to cart');
      openUserModal('login');
      return;
    }

    try {
      const response = await api.post(`/cart/${cart.id}?productId=${product.id}&quantity=${quantity}`) as { success: boolean; data: any };

      if (!response.success) {
        toast.error('Your session has expired. Please login again');
        openUserModal('login');
        return;
      }
      const data = response.data;
      
      updateCart(data.data);
      if (data.success) {
        toast.success('Item added to cart successfully!');
        setIsCartOpen(true); 
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  };

  const toggleZoom = (src: string) => {
    setZoomImage(prev => ({
      show: !prev.show,
      src: prev.show ? '' : src
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="text-gray-600">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
          <FiAlertCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error || 'Product not found'}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">      
        {/* Product Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Product Images */}
            <div className="lg:w-1/2 p-6">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden group transition-all duration-300">
                <div className="relative w-full pt-[100%]">
                  <img 
                    src={images[currentImage].startsWith('http') ? images[currentImage] : '/placeholder-product.jpg'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-contain p-6 cursor-zoom-in transition-transform duration-300 hover:scale-105"
                    onClick={() => toggleZoom(images[currentImage].startsWith('http') ? images[currentImage] : '/placeholder-product.jpg')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                
                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
                    onClick={prevImage}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button 
                    className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <FiChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
                
                {/* Fullscreen Button */}
                <button 
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                  onClick={() => toggleZoom(images[currentImage].startsWith('http') ? images[currentImage] : '/placeholder-product.jpg')}
                  aria-label="View fullscreen"
                >
                  <FiMaximize2 className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* Discount Badge */}
                {product.salePrice < product.price && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex mt-6 space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button 
                    key={index}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImage === index 
                        ? 'border-orange-500 ring-2 ring-orange-200 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentImage(index)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img 
                      src={img.startsWith('http') ? img : '/placeholder-product.jpg'}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-1/2 p-6 lg:px-8 lg:py-10">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
                  <div className="flex items-center mb-6">
                    <StarRating productId={product.id} />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={toggleWishlist}
                    className={`p-2.5 rounded-full ${
                      isInWishlist 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                    } transition-colors`}
                    disabled={wishlistLoading}
                    aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <FiHeart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Share product"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">₹{product.salePrice?.toLocaleString('en-IN')}</span>
                  {product.salePrice < product.price && (
                    <span className="ml-3 text-lg text-gray-500 line-through">₹{product.price?.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-green-600 font-medium">
                  {product.stock > 5 ? 'In Stock' : `Only ${product.stock} left!`}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">Quantity</span>
                  <span className="text-xs text-gray-500">{product.stock} available</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
                    <button 
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 h-12 w-10 flex items-center justify-center transition-colors"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-base font-medium border-l border-r border-gray-200 h-12 flex items-center justify-center">
                      {quantity}
                    </span>
                    <button 
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 h-12 w-10 flex items-center justify-center transition-colors"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= (product.stock || 1)}
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 space-y-3">
                {isProductInCart() ? (
                  <button 
                    onClick={() => navigate('/cart')} 
                    className="w-full bg-black text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    View Cart & Checkout
                  </button>
                ) : (
                  <button 
                    onClick={handleAddToCart} 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                  >
                    Add to Cart
                  </button>
                )}
                
                <button 
                  onClick={handleBuyNow}
                  className="w-full bg-[var(--button)] hover:bg-[var(--button-hover)] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Buy Now
                </button>
                
                <div className="flex justify-center space-x-4 mt-2">
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    <FiShare2 className="w-4 h-4 mr-1" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FiTruck className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                      <p className="text-sm text-gray-500">On orders over ₹499</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiShield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                      <p className="text-sm text-gray-500">100% secure payment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedTab('description')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  selectedTab === 'description'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setSelectedTab('specifications')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  selectedTab === 'specifications'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
            </nav>
          </div>
          <div className="p-6">
            {selectedTab === 'description' && (
              <div className="prose max-w-none text-gray-600">
                <p>{product.description || 'No description available for this product.'}</p>
              </div>
            )}
            {selectedTab === 'specifications' && (
              <div className="space-y-4">
                <ProductHighlights/>
              </div>
            )}            
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="mt-12">
          <CustomerRating productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts currentProductId={product.id} categoryId={product.categoryId}  onAddToCart={handleAddToCart}/>
        </div>

        {/* Recently Viewed */}
        <div className="mt-12">
          <RecentlyWatched/>
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Zoom Modal */}
      {zoomImage.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage({ show: false, src: '' })}
        >
          <div className="max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <img 
              src={zoomImage.src} 
              alt="Zoomed product" 
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;