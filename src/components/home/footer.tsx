import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';
import { SiPhonepe, SiGooglepay, SiPaytm } from 'react-icons/si';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-gradient-to-b from-gray-50 to-gray-100 w-full border-t border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Logo and About */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center mb-4">
                            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] bg-clip-text text-transparent">99Notes</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Empowering students with high-quality, affordable study materials for competitive exams. 
                            Your success is our priority.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { icon: <FaFacebookF size={16} />, color: 'hover:text-[var(--primary)]', name: 'Facebook' },
                                { icon: <FaTwitter size={16} />, color: 'hover:text-blue-400', name: 'Twitter' },
                                { icon: <FaInstagram size={16} />, color: 'hover:text-pink-600', name: 'Instagram' },
                                { icon: <FaLinkedinIn size={16} />, color: 'hover:text-blue-700', name: 'LinkedIn' },
                                { icon: <FaYoutube size={16} />, color: 'hover:text-red-600', name: 'YouTube' },
                            ].map((social, index) => (
                                <a 
                                    key={index} 
                                    href="#" 
                                    className={`text-gray-400 ${social.color} transition-colors duration-300`}
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-800 font-semibold text-lg mb-5 relative pb-2">
                            Quick Links
                            <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-[var(--primary)]"></span>
                        </h3>
                        <ul className="space-y-3">
                            {['Home', 'Products', 'Contact Us'].map((item, index) => (
                                <li key={index}>
                                    <Link 
                                        to={`/${item.toLowerCase().replace(' ', '-')}`} 
                                        className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-300 flex items-center"
                                    >
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-gray-800 font-semibold text-lg mb-5 relative pb-2">
                            Contact Us
                            <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-[var(--primary)]"></span>
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start text-gray-600 text-sm">
                                <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                info@99notes.in
                            </li>
                            <li className="flex items-start text-gray-600 text-sm">
                                <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +91 9654638994
                            </li>
                            <li className="flex items-start text-gray-600 text-sm">
                                <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                New Delhi, India
                            </li>
                        </ul>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h3 className="text-gray-800 font-semibold text-lg mb-5 relative pb-2">
                            We Accept
                            <span className="absolute bottom-0 left-0 w-10 h-0.5 bg-[var(--primary)]"></span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                                <FaCcVisa className="text-2xl text-blue-900" />
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                                <FaCcMastercard className="text-2xl text-red-600" />
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                                <FaCcPaypal className="text-2xl text-blue-700" />
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                                <SiPhonepe className="text-2xl text-blue-600" />
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                                <SiGooglepay className="text-2xl text-blue-500" />
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
                                <SiPaytm className="text-2xl text-blue-500" />
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
                <div className="border-t border-gray-200 bg-[var(--primary)] mt-2 p-2">
                        <p className="text-gray-800 text-sm  text-center">
                            &copy; {currentYear} 99Notes. All rights reserved.
                        </p>
            </div>
        </footer>
    );
};

export default Footer;
