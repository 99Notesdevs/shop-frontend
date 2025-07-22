import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="bg-[var(--bg-light)] py-4">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-[var(--text-light)]">
                    &copy; {new Date().getFullYear()} 99notes. All rights reserved.
                </div>
                    <div className="text-sm text-[var(--text-light)]">
                        <Link to="/about">About</Link> | <Link to="/contact">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
