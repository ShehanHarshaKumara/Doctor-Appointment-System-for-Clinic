import { Calendar, Clock, Award, Users } from 'lucide-react';

interface HeroProps {
  onBookNow: () => void;
}

export function Hero({ onBookNow }: HeroProps) {
  const stats = [
    { icon: Users, label: 'Patients Served', value: '15,000+' },
    { icon: Award, label: 'Expert Doctors', value: '50+' },
    { icon: Calendar, label: 'Appointments', value: '100k+' },
    { icon: Clock, label: 'Available 24/7', value: 'Always' },
  ];

  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Welcome to MediCare Clinic
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Health is Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> Priority</span>
            </h1>

            <p className="text-xl text-gray-600">
              Book appointments with top-rated doctors, track your health progress, and manage your medical records all in one place.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onBookNow}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Book Appointment
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-50 p-8 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop"
                alt="Medical professionals"
                className="rounded-2xl shadow-2xl object-cover w-full h-full"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Certified Professionals</p>
                  <p className="text-sm text-gray-500">All doctors are board-certified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
