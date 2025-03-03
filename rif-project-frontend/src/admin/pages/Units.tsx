import React, { useState, useEffect } from "react";
import { Dropdown } from "flowbite-react";
import { MdKeyboardArrowDown } from "react-icons/md";

interface MainUnit {
  id: number;
  mainUnit: string;
  mainUnitType: "Academic" | "Administrative";
}

const MainUnits: React.FC = () => {
  const [mainUnits, setMainUnits] = useState<MainUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState<string | null>(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitForm, setUnitForm] = useState<Partial<MainUnit>>({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<MainUnit | null>(null);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [unitToSave, setUnitToSave] = useState<Partial<MainUnit>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMainUnits = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/main-units", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMainUnits(data);
      } catch (error) {
        console.error("Error fetching main units:", error);
      }
    };

    fetchMainUnits();
  }, [token]);

  const handleSaveUnit = async () => {
    setShowSaveConfirmation(false);
    try {
      const response = await fetch(
        `http://localhost:8080/api/main-units/${unitForm.id || ""}`,
        {
          method: unitForm.id ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(unitForm),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUnit = await response.json();
      setMainUnits((prev) => {
        const units = prev.filter((unit) => unit.id !== updatedUnit.id);
        units.push(updatedUnit);
        return units;
      });
      setShowUnitForm(false);
      setUnitForm({});
    } catch (error) {
      console.error("Error saving unit:", error);
    }
  };

  const handleEditUnit = (unit: MainUnit) => {
    setUnitForm(unit);
    setShowUnitForm(true);
  };

  const handleDeleteUnit = async () => {
    setShowDeleteConfirmation(false);
    try {
      await fetch(`http://localhost:8080/api/main-units/${unitToDelete?.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMainUnits((prev) =>
        prev.filter((unit) => unit.id !== unitToDelete?.id)
      );
      setUnitToDelete(null);
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };

  const confirmDeleteUnit = (unit: MainUnit) => {
    setUnitToDelete(unit);
    setShowDeleteConfirmation(true);
  };

  const confirmSaveUnit = (unit: Partial<MainUnit>) => {
    setUnitToSave(unit);
    setShowSaveConfirmation(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUnitFilterChange = (type: string | null) => {
    setUnitFilter(type);
  };

  const filteredUnits = mainUnits.filter((unit) => {
    const unitMatch = !unitFilter || unit.mainUnitType === unitFilter;
    return (
      unit.mainUnit.toLowerCase().includes(searchQuery.toLowerCase()) &&
      unitMatch
    );
  });

  const indexOfLastUnit = currentPage * itemsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - itemsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);

  const handleAddUnit = () => {
    setUnitForm({});
    setShowUnitForm(true);
  };

  const handleCancelUnitForm = () => {
    setUnitForm({});
    setShowUnitForm(false);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight"> Units</h2>
        <div className="flex justify-between items-center">
          <p className="text-neutral-500 text-xl mt-3">Add or edit units</p>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleAddUnit}
          >
            Add Unit
          </button>
        </div>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="relative overflow-x-auto">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
          <div>
            <Dropdown
              label={unitFilter ? unitFilter : "Filter"}
              inline
              dismissOnClick={true}
              renderTrigger={() => (
                <button
                  id="dropdownActionButton"
                  data-dropdown-toggle="dropdownAction"
                  className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                  type="button"
                >
                  {unitFilter ? unitFilter : "Filter"}
                  <MdKeyboardArrowDown className="ml-2 h-5 w-5" />
                </button>
              )}
            >
              <Dropdown.Item onClick={() => handleUnitFilterChange(null)}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleUnitFilterChange("Academic")}>
                Academic
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleUnitFilterChange("Administrative")}
              >
                Administrative
              </Dropdown.Item>
            </Dropdown>
          </div>
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
              id="table-search-units"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for units"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-yellow-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                Unit
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUnits.length > 0 ? (
              currentUnits.map((unit) => (
                <tr
                  key={unit.id}
                  className="bg-white border-b hover:bg-gray-100"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {unit.mainUnit}
                  </td>
                  <td className="px-6 py-4">{unit.mainUnitType}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUnit(unit)}
                        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteUnit(unit)}
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
                  No units found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="inline-flex items-center -space-x-px">
              {Array.from({
                length: Math.ceil(filteredUnits.length / itemsPerPage),
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

      {showUnitForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              {unitForm.id ? "Edit Unit" : "Add Unit"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmSaveUnit(unitForm);
              }}
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="mainUnit"
                >
                  Main Unit
                </label>
                <input
                  type="text"
                  id="mainUnit"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={unitForm.mainUnit || ""}
                  onChange={(e) =>
                    setUnitForm({ ...unitForm, mainUnit: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="mainUnitType"
                >
                  Type
                </label>
                <select
                  id="mainUnitType"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={unitForm.mainUnitType || ""}
                  onChange={(e) =>
                    setUnitForm({
                      ...unitForm,
                      mainUnitType: e.target.value as MainUnit["mainUnitType"],
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={handleCancelUnitForm}
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
              Are you sure you want to delete the unit: {unitToDelete?.mainUnit}
              ?
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
                onClick={handleDeleteUnit}
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
              Are you sure you want to save the changes to the unit:{" "}
              {unitToSave?.mainUnit}?
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
                onClick={handleSaveUnit}
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

export default MainUnits;
