import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function BookAppointment() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    doctor: '',
    date: '',
    time: '',
    symptoms: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const doctors = [
    'Dr. Sarah Johnson - Cardiology',
    'Dr. Michael Chen - Neurology',
    'Dr. Emily Rodriguez - Pediatrics',
    'Dr. James Williams - Orthopedics',
    'Dr. Priya Patel - Dermatology',
    'Dr. Robert Taylor - General Medicine',
  ];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.doctor || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitted(true);
    toast.success('Appointment booked successfully!');

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        doctor: '',
        date: '',
        time: '',
        symptoms: '',
      });
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitted) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Appointment Confirmed!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Your appointment has been successfully booked.
            </p>
            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment Number:</span>
                  <span className="font-semibold text-gray-900">APP-2026-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-semibold text-gray-900">{formData.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-900">{formData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold text-gray-900">{formData.time}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              A confirmation email has been sent to <strong>{formData.email}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Appointment
          </h2>
          <p className="text-xl text-gray-600">
            Choose your preferred doctor and time slot
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Select Doctor *
              </label>
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor, index) => (
                  <option key={index} value={doctor}>
                    {doctor}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Appointment Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Preferred Time *
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors"
                required
              >
                <option value="">Select time slot</option>
                {timeSlots.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Symptoms / Reason for Visit
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition-colors resize-none"
              placeholder="Please describe your symptoms or reason for consultation..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
}
