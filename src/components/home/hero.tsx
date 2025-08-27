import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { env } from "../../config/env";
import axios from "axios";
import { BookOpen, Award, Clock, CheckCircle } from "lucide-react";

interface BannerData {
  isActive: boolean;
  title: string;
  description: string;
  redirectLink: string;
}

export default function Hero() {
  const navigate = useNavigate();
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await axios.get(`${env.API_MAIN}/about-99-notes/banner`);
        console.log("Banner data", response.data);
        if (response.data?.data?.content) {
          const content = typeof response.data.data.content === 'string' 
            ? JSON.parse(response.data.data.content) 
            : response.data.data.content;
          if (content.isActive) {
            setBannerData({
              isActive: content.isActive,
              title: content.title,
              description: content.description,
              redirectLink: content.redirectLink
            });
          }
        }
      } catch (error) {
        console.error("Error fetching banner data:", error);
        // Don't show banner if API fails
        setBannerData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  const features = [
    { icon: <BookOpen className="w-5 h-5" />, text: "Comprehensive Collection" },
    { icon: <Award className="w-5 h-5" />, text: "Top Quality Materials" },
    { icon: <Clock className="w-5 h-5" />, text: "Latest Editions" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Best Prices" }
  ];

  const handleNavigation = (redirectLink: string) => {
    // Check if it's an external URL
    if (redirectLink.startsWith('http://') || redirectLink.startsWith('https://')) {
      window.location.href = redirectLink;
    } else {
      // For internal routes
      navigate(redirectLink);
    }
  };

  if (isLoading) {
    return <div className="h-96 flex items-center justify-center">Loading...</div>;
  }

  // If banner is not active or no data, don't show the hero section
  if (!bannerData?.isActive) {
    return null;
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -left-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">   
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6"
            dangerouslySetInnerHTML={{ 
              __html: bannerData.title.replace(/\n/g, '<br/>') 
            }}
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {bannerData.description}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <Button 
              className="px-8 py-6 text-lg font-semibold bg-[var(--button)] hover:bg-[var(--button-hover)] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              onClick={() => handleNavigation(bannerData.redirectLink)}
            >
              Explore Products
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <span className="text-indigo-500">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
