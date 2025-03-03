import React, { useState, useEffect } from "react";

const Hero: React.FC = () => {
  const [content, setContent] = useState("");
  const [header, setHeader] = useState("");
  const [header2, setHeader2] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/textcontent/HeroSection",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setContent(data.content);
      } catch (error) {
        console.error("Error fetching text content:", error);
      }
    };

    const fetchHeader = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/textcontent/HeroHeader",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setHeader(data.content);
      } catch (error) {
        console.error("Error fetching text header:", error);
      }
    };

    const fetchHeader2 = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/textcontent/HeroHeader2",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setHeader2(data.content);
      } catch (error) {
        console.error("Error fetching text header:", error);
      }
    };

    fetchContent();
    fetchHeader();
    fetchHeader2();
  }, []);

  return (
    <>
      <section className="relative bg-cover object-center bg-fixed bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg')] bg-blend-multiply">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-900 opacity-50"></div>
        <div className="relative">
          <div className="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none  text-white md:text-5xl lg:text-6xl">
              {header} <span className="text-yellow-400">{header2}</span>
            </h1>
            <p className="mb-8 text-lg font-normal text-white lg:text-xl sm:px-16 lg:px-48">
              {content}
            </p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              <a
                href="#"
                className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-yellow-500 hover:bg-yellow-600 "
              >
                Get started
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="inline-flex justify-center hover:text-gray-900 items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
