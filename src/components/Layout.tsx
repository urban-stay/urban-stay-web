import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route/link click
  const handleNavClick = () => setMenuOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { href: '#about', label: 'About Us' },
    { href: '#facilities', label: 'Facilities' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#contact', label: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header
        className={`bg-white shadow-md fixed w-full top-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'py-1' : 'py-0'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">

            {/* Logo */}
            <div
              className={`flex items-center gap-2 sm:gap-3 transition-all duration-500 ${
                isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-amber-100 rounded-lg flex items-center justify-center border-2 border-amber-600 hover:rotate-12 transition-transform duration-300 flex-shrink-0">
                <span className="text-amber-700 text-sm sm:text-base md:text-lg lg:text-xl font-bold">TUS</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-amber-700 leading-tight truncate">
                  The Urban Stay
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">A Safe Haven</p>
              </div>
            </div>

            {/* Desktop nav */}
            <ul
              className={`hidden md:flex space-x-6 lg:space-x-8 transition-all duration-700 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
              }`}
            >
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium text-sm lg:text-base relative group"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 group-hover:w-full transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 z-50 relative"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-6 h-0.5 bg-amber-700 rounded transition-all duration-300 ${
                  menuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-amber-700 rounded transition-all duration-300 ${
                  menuOpen ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block w-6 h-0.5 bg-amber-700 rounded transition-all duration-300 ${
                  menuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        <div
          className={`md:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${
            menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
              menuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleNavClick}
          />

          {/* Menu panel */}
          <div
            className={`absolute top-0 right-0 h-full w-64 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
              menuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="px-6 py-8 flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">
                Navigation
              </p>
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={handleNavClick}
                  className="py-3 px-2 text-gray-800 font-medium text-base border-b border-gray-100 hover:text-amber-600 hover:pl-4 transition-all duration-200"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN ────────────────────────────────────────────── */}
      {/* pt-16 offsets the fixed header; adjust if header height changes */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-3 sm:mb-4 transform transition-all duration-500 hover:scale-105">
            <h3 className="text-xl sm:text-2xl font-bold text-amber-400">The Urban Stay</h3>
            <p className="text-sm sm:text-base text-gray-400">A Safe Haven for Women</p>
          </div>
          <p className="text-xs sm:text-sm text-gray-300">
            © 2026 The Urban Stay - A Safe Haven. All rights reserved.
          </p>
          <a
            href="https://theurbanstaypg.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 hover:text-amber-400 transition-colors duration-300 inline-block"
          >
            https://theurbanstaypg.in
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;