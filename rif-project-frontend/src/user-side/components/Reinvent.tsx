import React, { useState, useEffect } from "react";
import history from "../../assets/history.png";
import form from "../../assets/form.png";

const Reinvent: React.FC = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/textcontent/ReinventSection",
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
      <section className="bg-yellow-100 dark:bg-gray-900">
        <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">
          <div className="font-light text-gray-500 sm:text-lg dark:text-gray-400">
            <h2 className="mb-4 text-4xl font-extrabold text-gray-900 ">
              A robust and efficient tool for risk management
            </h2>
            <p className="mb-4">{content}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <img
              className="w-full rounded-lg shadow-lg"
              src={form}
              alt="office content 1"
            />
            <img
              className="mt-4 w-full rounded-lg lg:mt-10 shadow-lg"
              src={history}
              alt="office content 2"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Reinvent;
