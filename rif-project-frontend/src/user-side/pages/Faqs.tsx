import React from "react";
import FaqSection from "../components/FaqSection";

const Faqs: React.FC = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4  min-h-screen my-24">
      <div className="flex flex-col items-right">
        <div className="flex flex-col items-right">
          <h2 className="font-bold text-5xl mt-5 tracking-tight">
            Frequently Asked Questions
          </h2>
          <hr className="h-px my-8 border-yellow-500 border-2" />
          <div className="container mx-auto ">
            <FaqSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faqs;
