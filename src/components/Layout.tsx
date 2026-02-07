import React, { useState, useEffect, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

// interface LayoutProps {
//   children: ReactNode;
// }

const Layout = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className={`bg-white shadow-md fixed w-full top-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'py-2' : 'py-0'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className={`flex items-center gap-3 transition-transform duration-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center border-2 border-amber-600 hover:rotate-12 transition-transform duration-300">
                <div className="text-amber-700 text-2xl font-bold">TUS</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-700">The Urban Stay</h1>
                <p className="text-sm text-gray-600">A Safe Haven</p>
              </div>
            </div>
            <ul className={`hidden md:flex space-x-8 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <li><a href="#about" className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </a></li>
              <li><a href="#facilities" className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
                Facilities
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </a></li>
              <li><a href="#gallery" className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
                Gallery
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </a></li>
              <li><a href="#contact" className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group">
                Contact Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300"></span>
              </a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 transform transition-all duration-500 hover:scale-110">
            <h3 className="text-2xl font-bold text-amber-400">The Urban Stay</h3>
            <p className="text-gray-400">A Safe Haven for Women</p>
          </div>
          <p className="text-gray-300">© 2026 The Urban Stay - A Safe Haven. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2 hover:text-amber-400 transition-colors duration-300">https://theurbanstaypg.in</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;