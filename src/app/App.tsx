import { useState } from 'react';
import { Toaster } from 'sonner';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Doctors } from './components/Doctors';
import { BookAppointment } from './components/BookAppointment';
import { HealthTracker } from './components/HealthTracker';
import { Footer } from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Toaster position="top-right" richColors />
      <Navigation activeSection={activeSection} onNavigate={scrollToSection} />

      <main>
        <section id="home">
          <Hero onBookNow={() => scrollToSection('book')} />
        </section>

        <section id="services">
          <Services />
        </section>

        <section id="doctors">
          <Doctors />
        </section>

        <section id="book">
          <BookAppointment />
        </section>

        <section id="health">
          <HealthTracker />
        </section>

        <section id="contact">
          <Footer />
        </section>
      </main>
    </div>
  );
}