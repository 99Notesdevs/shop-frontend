import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiHeart, FiShare2, FiMinus, FiPlus } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaPinterest, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  
  const product = {
    title: "Ancient India",
    price: 349.00,
    rating: 5,
    reviews: 9,
    categories: ["Ancient India", "History"],
    description: [
      "A comprehensive guide to Ancient Indian history, covering major events, cultures, and civilizations that shaped the Indian subcontinent.",
      "This book provides an in-depth exploration of India's rich historical heritage, from the Indus Valley Civilization to the Mughal Empire.",
      "Key features include:",
      "✓ Detailed analysis of major dynasties and empires",
      "✓ Insights into cultural and scientific achievements",
      "✓ Exploration of trade routes and economic systems",
      "✓ Examination of religious and philosophical developments",
      "✓ Illustrated with maps, timelines, and artifacts"
    ],
    highlights: [
      "Comprehensive coverage of 5000+ years of history",
      "Written by renowned historians",
      "Includes study questions and further reading",
      "Perfect for students and history enthusiasts"
    ]
  };

  const images = [
    "/images/ancient-india-1.jpg",
    "/images/ancient-india-2.jpg",
    "/images/ancient-india-3.jpg",
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{product.title} - 99Notes</title>
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
            <li className="text-gray-900 font-medium">{product.title}</li>
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
                    alt={product.title}
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
                        alt={`${product.title} ${index + 1}`}
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="md:w-1/2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 ml-2">({product.reviews} customer reviews)</span>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-6">₹{product.price.toFixed(2)}</div>

              <div className="flex items-center mb-6">
                <span className="text-gray-700 mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleQuantityChange(quantity - 1)}
                  >
                    <FiMinus />
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    value={quantity} 
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-12 text-center border-x border-gray-300 py-1 outline-none"
                  />
                  <button 
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md transition-colors">
                  ADD TO CART
                </button>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3 px-6 rounded-md transition-colors">
                  BUY NOW
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <FiHeart className="mr-2" />
                  <span>Add to wishlist</span>
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
                    {product.categories.map((category, index) => (
                      <a key={index} href="#" className="text-blue-600 hover:underline">
                        {category}{index < product.categories.length - 1 ? ',' : ''}
                      </a>
                    ))}
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
            <div className="space-y-4 text-gray-700">
              {product.description.map((paragraph, index) => (
                <p key={index} className={index >= 2 && index <= 7 ? 'ml-4' : ''}>
                  {paragraph}
                </p>
              ))}
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Highlights:</h3>
                <ul className="space-y-2">
                  {product.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;