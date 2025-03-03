import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const GetStarted: React.FC = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/textcontent/GetStartedSection",
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

    fetchContent();
  }, []);

  return (
    <>
      <section className="relative bg-cover object-center bg-[url('https://planetofhotels.com/guide/sites/default/files/styles/paragraph__hero_banner__hb_image__1880bp/public/hero_banner/Arch-of-the-Centuries.jpg')] bg-gray-500 bg-blend-multiply">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-900 opacity-50"></div>
        <div className="relative">
          <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-md text-center">
              <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white">
                Embrace the Future of Risk Management
              </h2>
              <p className="mb-6 font-light text-white dark:text-gray-400 md:text-lg">
                {content}
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                <Link
                  to="/form"
                  className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-yellow-500 hover:bg-yellow-600 "
                >
                  Fill up form
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
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GetStarted;
