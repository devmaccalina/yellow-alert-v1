import React, { useState, useEffect } from "react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const FaqManagement: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqForm, setFaqForm] = useState<Partial<FAQ>>({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [faqToSave, setFaqToSave] = useState<Partial<FAQ>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/faqs", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFaqs(data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };

    fetchFaqs();
  }, [token]);

  const handleSaveFaq = async () => {
    setShowSaveConfirmation(false);
    try {
      const response = await fetch(
        `http://localhost:8080/api/faqs/${faqForm.id || ""}`,
        {
          method: faqForm.id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(faqForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedFaq = await response.json();
      setFaqs((prev) => {
        const faqs = prev.filter((faq) => faq.id !== updatedFaq.id);
        faqs.push(updatedFaq);
        return faqs;
      });
      setShowFaqForm(false);
      setFaqForm({});
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  const handleEditFaq = (faq: FAQ) => {
    setFaqForm(faq);
    setShowFaqForm(true);
  };

  const handleDeleteFaq = async () => {
    setShowDeleteConfirmation(false);
    try {
      await fetch(`http://localhost:8080/api/faqs/${faqToDelete?.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setFaqs((prev) => prev.filter((faq) => faq.id !== faqToDelete?.id));
      setFaqToDelete(null);
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const confirmDeleteFaq = (faq: FAQ) => {
    setFaqToDelete(faq);
    setShowDeleteConfirmation(true);
  };

  const confirmSaveFaq = (faq: Partial<FAQ>) => {
    setFaqToSave(faq);
    setShowSaveConfirmation(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastFaq = currentPage * itemsPerPage;
  const indexOfFirstFaq = indexOfLastFaq - itemsPerPage;
  const currentFaqs = filteredFaqs.slice(indexOfFirstFaq, indexOfLastFaq);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAddFaq = () => {
    setFaqForm({});
    setShowFaqForm(true);
  };

  const handleCancelFaqForm = () => {
    setFaqForm({});
    setShowFaqForm(false);
  };

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">FAQs</h2>
        <div className="flex justify-between items-center">
          <p className="text-neutral-500 text-xl mt-3">Add or edit FAQs</p>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleAddFaq}
          >
            Add FAQ
          </button>
        </div>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="relative overflow-x-auto">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="table-search-faqs"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for FAQs"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-yellow-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                Question
              </th>
              <th scope="col" className="px-6 py-3">
                Answer
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentFaqs.length > 0 ? (
              currentFaqs.map((faq) => (
                <tr
                  key={faq.id}
                  className="bg-white border-b hover:bg-gray-100"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {faq.question}
                  </td>
                  <td className="px-6 py-4">{faq.answer}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditFaq(faq)}
                        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteFaq(faq)}
                        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No FAQs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="inline-flex items-center -space-x-px">
              {Array.from({
                length: Math.ceil(filteredFaqs.length / itemsPerPage),
              }).map((_, index) => (
                <li key={index}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                      currentPage === index + 1 ? "bg-gray-200" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {showFaqForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              {faqForm.id ? "Edit FAQ" : "Add FAQ"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmSaveFaq(faqForm);
              }}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="question"
                >
                  Question
                </label>
                <input
                  type="text"
                  id="question"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={faqForm.question || ""}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, question: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="answer"
                >
                  Answer
                </label>
                <textarea
                  rows={4}
                  id="answer"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={faqForm.answer || ""}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, answer: e.target.value })
                  }
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={handleCancelFaqForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete the FAQ: '{faqToDelete?.question}
              '?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeleteFaq}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Save</h2>
            <p className="mb-4">
              Are you sure you want to save the changes to the FAQ: '
              {faqToSave?.question}'?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowSaveConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleSaveFaq}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqManagement;
