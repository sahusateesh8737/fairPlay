import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Audience from '../components/Audience';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Audience />
      
      {/* Simple Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} fairPlay. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
