import React, { useState, useEffect, type JSX } from 'react';
import { Home, Wifi, Camera, Shield, Zap, Coffee, Droplet, Wind, Car, MapPin, Phone, Mail, ChevronDown } from 'lucide-react';
import { sendContactAPI } from '../service';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  phoneNumber: string;
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
    message: '',
    phoneNumber: '',
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const response = await sendContactAPI(formData);
      if (response?.data) {
        alert('✅ Thank you! Your message has been sent. Check your email for confirmation.');
        setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '', phoneNumber: '' });
      } else {
        alert(`❌ Failed to send: ${response?.status}`);
      }
    } catch {
      alert('❌ Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData({ ...formData, [field]: value });
  };

  const facilities: Facility[] = [
    { icon: <Home className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'AC / Non AC Rooms' },
    { icon: <Wifi className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'High-Speed WiFi' },
    { icon: <Camera className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'CCTV Security' },
    { icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'Power Backup' },
    { icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />, name: '24/7 Security' },
    { icon: <Coffee className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'Meals Provided' },
    { icon: <Droplet className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'Mineral Water' },
    { icon: <Wind className="w-6 h-6 sm:w-8 sm:h-8" />, name: 'Washing Machine' },
  ];

  const galleryImages: string[] = [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500&h=400&fit=crop',
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">Affordable & Comfortable PG Accommodation at Urban Stay</h1>

      {/* ── Hero ── */}
      <section className="pt-16 sm:pt-20 bg-gradient-to-br from-blue-50 via-teal-50 to-amber-50 relative overflow-hidden min-h-screen flex items-center">
        {/* Blobs */}
        <div className="absolute top-20 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-4 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />

        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-24 relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text */}
            <div className={`space-y-4 sm:space-y-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} text-center md:text-left`}>
              <span className="text-blue-400 text-4xl sm:text-5xl inline-block animate-bounce">🦋</span>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-amber-600 italic leading-tight">
                BEST<br />LADIES<br />HOSTEL
              </h2>
              <p className="text-xl sm:text-2xl lg:text-3xl text-amber-500 font-semibold">Mambakkam – Tamil Nadu</p>
              <p className="text-base sm:text-lg text-gray-700">Safe • Comfortable • Affordable</p>
            </div>

            {/* Image */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-full h-full bg-amber-200 rounded-2xl transform rotate-3" />
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=450&fit=crop"
                alt="The Urban Stay PG – ladies hostel Mambakkam"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
        </div>

        <style>{`
          @keyframes blob {
            0%,100%{transform:translate(0,0) scale(1)}
            33%{transform:translate(30px,-50px) scale(1.1)}
            66%{transform:translate(-20px,20px) scale(0.9)}
          }
          .animate-blob{animation:blob 7s infinite}
          .animation-delay-2000{animation-delay:2s}
          .animation-delay-4000{animation-delay:4s}
        `}</style>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
              About The Urban Stay – A Safe Haven
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-amber-600 font-semibold">
              The Urban Stay Ladies Hostel | Tamil Nadu | Mambakkam
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-amber-50 p-6 sm:p-8 rounded-2xl shadow-lg">
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed text-center">
              We offer safe, comfortable, and affordable accommodation for students and working professionals.
              Our fully furnished spaces include modern amenities, high-speed Wi-Fi, daily housekeeping, and
              nutritious meals. Located in Mambakkam, we provide a secure, homely environment designed for
              convenience, community living, and a hassle-free lifestyle.
            </p>
          </div>
        </div>
      </section>

      {/* ── Facilities ── */}
      <section id="facilities" className="py-12 sm:py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Facilities – Mambakkam</h2>
            <div className="w-24 sm:w-32 h-1 bg-amber-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className="bg-white p-5 sm:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center border-2 border-transparent hover:border-amber-400"
              >
                <div className="text-amber-600 flex justify-center mb-3 sm:mb-4">
                  {facility.icon}
                </div>
                <h3 className="text-gray-800 font-semibold text-xs sm:text-sm">{facility.name}</h3>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">Additional Amenities</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {[
                { label: '🍳 Breakfast' },
                { label: '🍱 Lunch' },
                { label: '🍽️ Dinner' },
                { label: '🧹 Daily Housekeeping' },
              ].map((item) => (
                <span
                  key={item.label}
                  className="bg-amber-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-gray-700 shadow-sm text-sm sm:text-base hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  {item.label}
                </span>
              ))}
              <span className="bg-amber-100 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-gray-700 shadow-sm text-sm sm:text-base flex items-center gap-1 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <Car className="inline w-4 h-4" /> Pickup &amp; Drop
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Gallery – Mambakkam</h2>
            <div className="w-24 sm:w-32 h-1 bg-amber-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl shadow-lg group"
              >
                <img
                  src={image}
                  alt={`The Urban Stay PG room ${index + 1}`}
                  className="w-full h-48 sm:h-64 md:h-72 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4 sm:pb-6">
                  <span className="text-white font-bold text-base sm:text-xl">View Image</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-12 sm:py-20 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Contact Us</h2>
            <div className="w-24 sm:w-32 h-1 bg-amber-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            {/* Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-600 mb-5 sm:mb-6">Let Us Know</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 w-full text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 w-full text-sm sm:text-base"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-sm sm:text-base"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    handleChange('phoneNumber', onlyNums);
                  }}
                  maxLength={10}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-sm sm:text-base"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 text-sm sm:text-base"
                />
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 resize-none text-sm sm:text-base"
                />
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? '⏳ Sending...' : 'Send Message'}
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="bg-amber-600 p-6 sm:p-8 rounded-2xl shadow-xl text-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Location – Mambakkam, TN</h3>
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Address</h4>
                    <p className="text-amber-50 text-sm sm:text-base">
                      No.54, Sudharshan Nagar, 2nd Street,<br />
                      Mambakkam, Chennai – 600127
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Phone</h4>
                    <a
                      href="tel:+918111068585"
                      className="text-amber-50 text-sm sm:text-base hover:text-white underline"
                    >
                      +91-8111068585
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">Email</h4>
                    <a
                      href="mailto:theurbanstay.pg@gmail.com"
                      className="text-amber-50 text-sm sm:text-base hover:text-white underline break-all"
                    >
                      theurbanstay.pg@gmail.com
                    </a>
                  </div>
                </div>

                {/* Embedded Map */}
                <div className="mt-4 sm:mt-6 rounded-xl overflow-hidden">
                  <iframe
                    title="The Urban Stay PG location"
                    src="https://www.google.com/maps?q=12.8868,80.0985&z=15&output=embed"
                    width="100%"
                    height="200"
                    className="w-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;