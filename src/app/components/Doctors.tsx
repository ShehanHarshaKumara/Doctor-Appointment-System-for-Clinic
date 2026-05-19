import { Star, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

export function Doctors() {
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  const doctors = [
    {
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      reviews: 320,
      availability: 'Mon, Wed, Fri',
      fee: '$150',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop',
    },
    {
      name: 'Dr. Michael Chen',
      specialization: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      reviews: 285,
      availability: 'Tue, Thu, Sat',
      fee: '$180',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop',
    },
    {
      name: 'Dr. Emily Rodriguez',
      specialization: 'Pediatrics',
      experience: '10 years',
      rating: 5.0,
      reviews: 450,
      availability: 'Mon - Fri',
      fee: '$120',
      image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop',
    },
    {
      name: 'Dr. James Williams',
      specialization: 'Orthopedics',
      experience: '18 years',
      rating: 4.7,
      reviews: 398,
      availability: 'Mon, Wed, Fri',
      fee: '$200',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop',
    },
    {
      name: 'Dr. Priya Patel',
      specialization: 'Dermatology',
      experience: '8 years',
      rating: 4.9,
      reviews: 275,
      availability: 'Tue - Sat',
      fee: '$140',
      image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&auto=format&fit=crop',
    },
    {
      name: 'Dr. Robert Taylor',
      specialization: 'General Medicine',
      experience: '20 years',
      rating: 4.8,
      reviews: 520,
      availability: 'Mon - Sat',
      fee: '$100',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop',
    },
  ];

  const specializations = ['All', ...new Set(doctors.map(d => d.specialization))];

  const filteredDoctors = selectedSpecialization === 'All'
    ? doctors
    : doctors.filter(d => d.specialization === selectedSpecialization);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet Our Expert Doctors
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experienced professionals dedicated to your health and well-being
          </p>
        </div>

        {/* Specialization Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedSpecialization === spec
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  <span className="font-semibold text-gray-900">{doctor.rating}</span>
                  <span className="text-gray-500 text-sm">({doctor.reviews})</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {doctor.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {doctor.specialization}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{doctor.availability}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Consultation Fee</p>
                    <p className="text-2xl font-bold text-gray-900">{doctor.fee}</p>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
