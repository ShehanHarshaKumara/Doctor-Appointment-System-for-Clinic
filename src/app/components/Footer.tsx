import { MapPin, Phone, Mail, Clock, Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-lg">MediCare</h3>
                <p className="text-xs text-gray-400">Your Health Partner</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Providing quality healthcare services with experienced professionals dedicated to your well-being.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#doctors" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Find a Doctor
                </a>
              </li>
              <li>
                <a href="#book" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Book Appointment
                </a>
              </li>
              <li>
                <a href="#health" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Health Tracker
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6">Our Services</h3>
            <ul className="space-y-3">
              <li className="text-gray-300">Cardiology</li>
              <li className="text-gray-300">Neurology</li>
              <li className="text-gray-300">Pediatrics</li>
              <li className="text-gray-300">Orthopedics</li>
              <li className="text-gray-300">Dermatology</li>
              <li className="text-gray-300">General Medicine</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  123 Healthcare Avenue<br />
                  Medical District, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <a href="tel:+15551234567" className="text-gray-300 hover:text-blue-400 transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <a href="mailto:info@medicare.com" className="text-gray-300 hover:text-blue-400 transition-colors">
                  info@medicare.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-gray-300">
                  <p>Mon - Fri: 8:00 AM - 8:00 PM</p>
                  <p>Sat - Sun: 9:00 AM - 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="bg-red-600 rounded-2xl p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl mb-2">24/7 Emergency Services</h3>
              <p className="text-gray-100">We're here when you need us most</p>
            </div>
            <a
              href="tel:911"
              className="px-8 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Call Emergency: 911
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 MediCare Clinic. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
