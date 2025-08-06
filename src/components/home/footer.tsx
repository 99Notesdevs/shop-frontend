import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-[var(--bg-pink)] w-full">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo and About */}
                    <div className="col-span-1">
                        <div className="flex items-center mb-4">
                            <span className="text-2xl font-bold text-gray-800">99Notes</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">
                            Empowering students with high-quality, affordable study materials for competitive exams.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">
                                <FaFacebookF size={18} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                                <FaTwitter size={18} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-pink-600 transition-colors">
                                <FaInstagram size={18} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-blue-700 transition-colors">
                                <FaLinkedinIn size={18} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-red-600 transition-colors">
                                <FaYoutube size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-600 hover:text-blue-600 text-sm">Home</Link></li>
                            <li><Link to="/about" className="text-gray-600 hover:text-blue-600 text-sm">About Us</Link></li>
                            <li><Link to="/products" className="text-gray-600 hover:text-blue-600 text-sm">Products</Link></li>
                            <li><Link to="/contact" className="text-gray-600 hover:text-blue-600 text-sm">Contact Us</Link></li>
                            <li><Link to="/blog" className="text-gray-600 hover:text-blue-600 text-sm">Blog</Link></li>
                        </ul>
                    </div>


                    {/* Contact */}
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-600 text-sm">
                                info@99notes.in
                            </li>
                            <li className="flex items-center text-gray-600 text-sm">
                                +91 9654638994
                            </li>
                            <li className="text-gray-600 text-sm">
                                New Delhi
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 bg-[var(--primary)] mt-2 p-2">
                        <p className="text-gray-600 text-sm  text-center">
                            &copy; {currentYear} 99Notes. All rights reserved.
                        </p>
                </div>
        </footer>
    );
};

export default Footer;
