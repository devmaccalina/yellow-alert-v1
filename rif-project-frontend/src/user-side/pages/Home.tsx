import React from "react";

import Hero from "../components/Hero";
import Reinvent from "../components/Reinvent";
import HeroIcons from "../components/HeroIcons";
import GetStarted from "../components/GetStarted";
import FaqSection from "../components/FaqSection";

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <HeroIcons />
      <Reinvent />
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Some of our frequently asked questions
        </h2>
        <FaqSection />
      </div>

      <GetStarted />
    </>
  );
};

export default Home;
