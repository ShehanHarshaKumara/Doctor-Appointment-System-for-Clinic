import { Heart, Brain, Bone, Eye, Baby, Stethoscope, Activity, Pill } from 'lucide-react';

export function Services() {
  const services = [
    {
      icon: Heart,
      title: 'Cardiology',
      description: 'Expert heart care and cardiovascular treatments',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Brain,
      title: 'Neurology',
      description: 'Advanced brain and nervous system care',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Bone,
      title: 'Orthopedics',
      description: 'Bone, joint, and muscle health services',
      color: 'from-orange-500 to-amber-500',
    },
    {
      icon: Eye,
      title: 'Ophthalmology',
      description: 'Complete eye care and vision solutions',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Baby,
      title: 'Pediatrics',
      description: 'Specialized care for children and infants',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Stethoscope,
      title: 'General Medicine',
      description: 'Primary care and general health checkups',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Activity,
      title: 'Dermatology',
      description: 'Skin, hair, and nail treatments',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Pill,
      title: 'Pharmacy',
      description: 'Quality medicines and health products',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Medical Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive healthcare services delivered by experienced professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {service.title}
              </h3>

              <p className="text-gray-600 text-sm">
                {service.description}
              </p>

              <div className="mt-4 text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
