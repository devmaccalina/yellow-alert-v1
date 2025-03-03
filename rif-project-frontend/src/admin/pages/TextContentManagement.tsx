import React, { useState, useEffect } from "react";

interface TextContent {
  id: number;
  component: string;
  content: string;
}

const TextContentManagement: React.FC = () => {
  const [textContents, setTextContents] = useState<TextContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTextContentForm, setShowTextContentForm] = useState(false);
  const [textContentForm, setTextContentForm] = useState<Partial<TextContent>>(
    {}
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [textContentToDelete, setTextContentToDelete] =
    useState<TextContent | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [textContentToSave, setTextContentToSave] = useState<
    Partial<TextContent>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTextContents = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/textcontent", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setTextContents(data);
      } catch (error) {
        console.error("Error fetching text contents:", error);
      }
    };

    fetchTextContents();
  }, [token]);

  const handleSaveTextContent = async () => {
    setShowSaveConfirmation(false);
    try {
      const response = await fetch(
        `http://localhost:8080/api/textcontent/${textContentForm.id || ""}`,
        {
          method: textContentForm.id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(textContentForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedTextContent = await response.json();
      setTextContents((prev) => {
        const textContents = prev.filter(
          (tc) => tc.id !== updatedTextContent.id
        );
        textContents.push(updatedTextContent);
        return textContents;
      });
      setShowTextContentForm(false);
      setTextContentForm({});
    } catch (error) {
      console.error("Error saving text content:", error);
    }
  };

  const handleEditTextContent = (textContent: TextContent) => {
    setTextContentForm(textContent);
    setShowTextContentForm(true);
  };

  const handleDeleteTextContent = async () => {
    setShowDeleteConfirmation(false);
    try {
      await fetch(
        `http://localhost:8080/api/textcontent/${textContentToDelete?.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setTextContents((prev) =>
        prev.filter((tc) => tc.id !== textContentToDelete?.id)
      );
      setTextContentToDelete(null);
    } catch (error) {
      console.error("Error deleting text content:", error);
    }
  };

  const confirmDeleteTextContent = (textContent: TextContent) => {
    setTextContentToDelete(textContent);
    setShowDeleteConfirmation(true);
  };

  const confirmSaveTextContent = (textContent: Partial<TextContent>) => {
    setTextContentToSave(textContent);
    setShowSaveConfirmation(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredTextContents = textContents.filter((tc) =>
    tc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastTextContent = currentPage * itemsPerPage;
  const indexOfFirstTextContent = indexOfLastTextContent - itemsPerPage;
  const currentTextContents = filteredTextContents.slice(
    indexOfFirstTextContent,
    indexOfLastTextContent
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAddTextContent = () => {
    setTextContentForm({});
    setShowTextContentForm(true);
  };

  const handleCancelTextContentForm = () => {
    setTextContentForm({});
    setShowTextContentForm(false);
  };

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">Home Content</h2>
        <div className="flex justify-between items-center">
          <p className="text-neutral-500 text-xl mt-3">
            Manage text content for the homepage
          </p>
          {/* <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleAddTextContent}
          >
            Add Text Content
          </button> */}
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
              id="table-search-text-content"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for text content"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-yellow-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                Component
              </th>
              <th scope="col" className="px-6 py-3">
                Content
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTextContents.length > 0 ? (
              currentTextContents.map((textContent) => (
                <tr
                  key={textContent.id}
                  className="bg-white border-b hover:bg-gray-100"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {textContent.component}
                  </td>
                  <td className="px-6 py-4">{textContent.content}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTextContent(textContent)}
                        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                      >
                        Edit
                      </button>
                      {/* <button
                        onClick={() => confirmDeleteTextContent(textContent)}
                        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                      >
                        Delete
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No text contents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="inline-flex items-center -space-x-px">
              {Array.from({
                length: Math.ceil(filteredTextContents.length / itemsPerPage),
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

      {showTextContentForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              {textContentForm.id ? "Edit Text Content" : "Add Text Content"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmSaveTextContent(textContentForm);
              }}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="component"
                >
                  Component
                </label>
                <input
                  type="text"
                  id="component"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={textContentForm.component || ""}
                  onChange={(e) =>
                    setTextContentForm({
                      ...textContentForm,
                      component: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="content"
                >
                  Content
                </label>
                <textarea
                  rows={4}
                  id="content"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={textContentForm.content || ""}
                  onChange={(e) =>
                    setTextContentForm({
                      ...textContentForm,
                      content: e.target.value,
                    })
                  }
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={handleCancelTextContentForm}
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
              Are you sure you want to delete the text content for component: '
              {textContentToDelete?.component}'?
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
                onClick={handleDeleteTextContent}
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
              Are you sure you want to save the changes to the text content for
              component: '{textContentToSave?.component}'?
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
                onClick={handleSaveTextContent}
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

export default TextContentManagement;
