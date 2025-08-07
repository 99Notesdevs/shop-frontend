import React from 'react';
import image from '../../assets/favicon.svg';

const ServiceItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="group flex flex-col items-center p-4 sm:p-6 rounded-xl hover:bg-gray-50 transition-colors duration-200">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-md transition-all duration-200">
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-sm font-medium text-gray-700 text-center">{text}</div>
  </div>
);

const ServiceIcon: React.FC = () => {
  return (
    <div className="bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          <ServiceItem 
            icon="🚚" 
            text="Pay On Delivery Available"
          />
          <ServiceItem 
            icon={
              <img 
                src={image} 
                alt="99notes Certified" 
                className="w-8 h-8"
              />
            } 
            text="99notes Certified"
          />
          <ServiceItem 
            icon="↩️" 
            text="7 Day Easy Return Policy"
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceIcon;