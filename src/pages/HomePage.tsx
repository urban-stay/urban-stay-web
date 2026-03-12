import React, { useState, useEffect, type JSX } from 'react';
import { Home, Wifi, Camera, Shield, Zap, Coffee, Droplet, Wind, Car, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import { sendContactAPI } from '../service';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

interface Facility {
  icon: JSX.Element;
  name: string;
}

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // const response = await fetch('http://localhost:8080/api/contact/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      const response = await sendContactAPI(formData)

      if (response?.data) {
        alert('✅ Thank you! Your message has been sent. Check your email for confirmation.');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
      } else {
        const error = response?.status;
        alert(`❌ Failed to send: ${error}`);
      }
    } catch (err) {
      alert('❌ Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData({ ...formData, [field]: value });
  };

  const facilities: Facility[] = [
    { icon: <Home className="w-8 h-8" />, name: 'AC / Non AC Rooms' },
    { icon: <Wifi className="w-8 h-8" />, name: 'High-Speed WiFi' },
    { icon: <Camera className="w-8 h-8" />, name: 'CCTV Security' },
    { icon: <Zap className="w-8 h-8" />, name: 'Power Backup' },
    { icon: <Shield className="w-8 h-8" />, name: '24/7 Security' },
    { icon: <Coffee className="w-8 h-8" />, name: 'Meals Provided' },
    { icon: <Droplet className="w-8 h-8" />, name: 'Mineral Water' },
    { icon: <Wind className="w-8 h-8" />, name: 'Washing Machine' }
  ];

  const galleryImages: string[] = [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500&h=400&fit=crop'
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Header */}
      {/* <header className={`bg-white shadow-md fixed w-full top-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'py-2' : 'py-0'}`}>
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
      </header> */}

      {/* Hero Section */}
      <section className="pt-20 bg-linear-to-br from-blue-50 via-teal-50 to-amber-50 relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="w-full px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="inline-block mb-4">
                <span className="text-blue-400 text-5xl inline-block animate-bounce">🦋</span>
              </div>
              <h1 className="text-7xl font-bold text-amber-600 mb-4 italic leading-tight animate-slide-in-left">
                BEST<br />LADIES<br />HOSTEL
              </h1>
              <p className="text-3xl text-amber-500 font-semibold animate-slide-in-left animation-delay-200">Mambakkam - Tamil Nadu</p>
              <p className="text-lg text-gray-700 animate-slide-in-left animation-delay-400">Safe • Comfortable • Affordable</p>
            </div>
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <div className="absolute -top-4 -left-4 w-full h-full bg-amber-200 rounded-2xl transform rotate-3 transition-transform duration-500 hover:rotate-6"></div>
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=450&fit=crop"
                alt="Beautiful landscape adventure"
                className="relative rounded-2xl shadow-2xl w-full transform transition-all duration-500 hover:scale-105 hover:shadow-3xl"
              />
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-amber-600" />
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes slide-in-left {
            from { transform: translateX(-50px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.8s ease-out;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
            animation-fill-mode: forwards;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
            opacity: 0;
            animation-fill-mode: forwards;
          }
        `}</style>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white relative overflow-hidden">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 transform transition-all duration-700 hover:scale-105">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">About The Urban Stay - A Safe Haven</h2>
            <p className="text-2xl text-amber-600 font-semibold">The Urban Stay Ladies Hostel | Tamil Nadu | Mambakkam</p>
          </div>
          <div className="max-w-4xl mx-auto bg-amber-50 p-8 rounded-2xl shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              We offer safe, comfortable, and affordable accommodation for students and working professionals.
              Our fully furnished spaces include modern amenities, high-speed Wi-Fi, daily housekeeping, and
              nutritious meals. Located in Mambakkam, we provide a secure, homely environment designed for
              convenience, community living, and a hassle-free lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-linear-to-b from-amber-50 to-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4 transform transition-all duration-500 hover:scale-110">Facilities - Mambakkam</h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {facilities.map((facility: Facility, index: number) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-2 text-center border-2 border-transparent hover:border-amber-400"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-amber-600 flex justify-center mb-4 transform transition-transform duration-300 hover:scale-125 hover:rotate-12">
                  {facility.icon}
                </div>
                <h3 className="text-gray-800 font-semibold text-sm">{facility.name}</h3>
              </div>
            ))}
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-xl transform transition-all duration-500 hover:shadow-2xl hover:scale-105">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Additional Amenities</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-linear-to-r from-amber-100 to-amber-200 px-6 py-3 rounded-full font-medium text-gray-700 shadow-md transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1">
                🍳 Breakfast
              </span>
              <span className="bg-linear-to-r from-amber-100 to-amber-200 px-6 py-3 rounded-full font-medium text-gray-700 shadow-md transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1">
                🍱 Lunch
              </span>
              <span className="bg-linear-to-r from-amber-100 to-amber-200 px-6 py-3 rounded-full font-medium text-gray-700 shadow-md transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1">
                🍽️ Dinner
              </span>
              <span className="bg-linear-to-r from-amber-100 to-amber-200 px-6 py-3 rounded-full font-medium text-gray-700 shadow-md transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1">
                <Car className="inline w-4 h-4 mr-1" /> Pickup & Drop
              </span>
              <span className="bg-linear-to-r from-amber-100 to-amber-200 px-6 py-3 rounded-full font-medium text-gray-700 shadow-md transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:-translate-y-1">
                🧹 Daily Housekeeping
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4 transform transition-all duration-500 hover:scale-110">Gallery - Mambakkam</h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryImages.map((image: string, index: number) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl shadow-lg group transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-72 object-cover transform group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                  <span className="text-white font-bold text-xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">View Image</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-linear-to-b from-amber-50 to-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4 transform transition-all duration-500 hover:scale-110">Contact Us</h2>
            <div className="w-32 h-1 bg-amber-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
              <h3 className="text-3xl font-bold text-amber-600 mb-6">Let Us Know</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 hover:border-amber-300"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 hover:border-amber-300"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 hover:border-amber-300"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 hover:border-amber-300"
                />
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 resize-none hover:border-amber-300"
                ></textarea>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-amber-600 to-amber-500 text-white py-4 rounded-lg font-bold text-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? '⏳ Sending...' : 'Send Message'}
                </button>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-linear-to-br from-amber-600 to-amber-500 p-8 rounded-2xl shadow-xl text-white transform transition-all duration-500 hover:shadow-2xl hover:scale-105">
              <h3 className="text-3xl font-bold mb-8">Location - Mambakkam, TN</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4 transform transition-all duration-300 hover:translate-x-2">
                  <MapPin className="w-6 h-6 mt-1 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Address:</h4>
                    <p className="text-amber-50">No.54, Sudharshan Nagar, 2nd Street,<br />Mambakkam, Chennai – 600127</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 transform transition-all duration-300 hover:translate-x-2">
                  <Phone className="w-6 h-6 mt-1 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Tel:</h4>
                    <p className="text-amber-50">+91-8111068585</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 transform transition-all duration-300 hover:translate-x-2">
                  <Mail className="w-6 h-6 mt-1 shrink-0 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">Email:</h4>
                    <p className="text-amber-50">theurbanstay.pg@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-10">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 transform transition-all duration-500 hover:scale-110">
            <h3 className="text-2xl font-bold text-amber-400">The Urban Stay</h3>
            <p className="text-gray-400">A Safe Haven for Women</p>
          </div>
          <p className="text-gray-300">© 2026 The Urban Stay - A Safe Haven. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2 hover:text-amber-400 transition-colors duration-300">https://theurbanstaypg.in</p>
        </div>
      </footer> */}
    </div>
  );
};

export default HomePage;