import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Audience from "../components/Audience";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Audience />

      {/* Simple Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} fairPlay. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Home;
