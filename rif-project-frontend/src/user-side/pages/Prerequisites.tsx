import React, { useState, useEffect, FormEvent, useContext } from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { FaTrashAlt } from "react-icons/fa";
import { Radio, Label } from "flowbite-react";
import { MdKeyboardArrowDown } from "react-icons/md";
import AuthContext from "../../auth/AuthContext";
import { Dropdown } from "flowbite-react";

interface Stakeholder {
  name: string;
}

interface Prerequisite {
  unit: string;
  unitType: string;
  internalStakeholders: Stakeholder[];
  externalStakeholders: Stakeholder[];
}

interface MainUnit {
  id: number;
  mainUnit: string;
  mainUnitType: "Academic" | "Administrative";
}

const Prerequisites: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [internalStakeholders, setInternalStakeholders] = useState<string[]>([
    "",
  ]);
  const [externalStakeholders, setExternalStakeholders] = useState<string[]>([
    "",
  ]);
  const [unit, setUnit] = useState("");
  const [unitType, setUnitType] = useState("");
  const [mainUnits, setMainUnits] = useState<MainUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<MainUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchMainUnits = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/main-units", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMainUnits(data);
        setFilteredUnits(data);
      } catch (error) {
        console.error("Failed to fetch main units", error);
      }
    };

    fetchMainUnits();
  }, []);

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/prerequisites",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUnit(data.unit || "");
          setSearchQuery(data.unit || ""); // Set the unit to searchQuery to display it
          setUnitType(data.unitType || "");
          setInternalStakeholders(
            data.internalStakeholders.length > 0
              ? data.internalStakeholders.map((s: Stakeholder) => s.name)
              : [""]
          );
          setExternalStakeholders(
            data.externalStakeholders.length > 0
              ? data.externalStakeholders.map((s: Stakeholder) => s.name)
              : [""]
          );
        }
      } catch (error) {
        console.error("Failed to fetch prerequisites", error);
      }
    };

    fetchPrerequisites();
  }, []);

  const addInternalStakeholder = () => {
    if (internalStakeholders[internalStakeholders.length - 1] !== "") {
      setInternalStakeholders([...internalStakeholders, ""]);
    }
  };

  const addExternalStakeholder = () => {
    if (externalStakeholders[externalStakeholders.length - 1] !== "") {
      setExternalStakeholders([...externalStakeholders, ""]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const filledInternalStakeholders = internalStakeholders.every(
      (i) => i.trim() !== ""
    );
    const filledExternalStakeholders = externalStakeholders.every(
      (e) => e.trim() !== ""
    );

    if (!filledInternalStakeholders || !filledExternalStakeholders) {
      alert("Please fill in all stakeholder fields before submitting.");
      return;
    }

    const trimmedUnit = unit.trim();

    if (!trimmedUnit) {
      alert("Please fill in the Administrative/Academic Unit field.");
      return;
    }

    if (!unitType.trim()) {
      alert("Please select the Unit Type.");
      return;
    }

    const url = "http://localhost:8080/api/prerequisites";
    const data = {
      unit: trimmedUnit,
      unitType,
      internalStakeholders: internalStakeholders.map((name) => ({ name })),
      externalStakeholders: externalStakeholders.map((name) => ({ name })),
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("Prerequisites saved successfully");
        alert("Data saved successfully!");
      } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
        alert(error.message);
      } else {
        console.error("Unexpected error", error);
        alert("An unexpected error occurred");
      }
    }
  };

  const handleUnitSelect = (selectedUnit: MainUnit) => {
    setUnit(selectedUnit.mainUnit);
    setUnitType(selectedUnit.mainUnitType);
    setSearchQuery(selectedUnit.mainUnit); // Automatically populate the search field
    setShowDropdown(false); // Hide the dropdown after selecting a unit
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filtered = mainUnits.filter((unit) =>
      unit.mainUnit.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUnits(filtered);
    setShowDropdown(true); // Show the dropdown only when the user is searching
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 min-h-screen my-24">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Prerequisites
        </h2>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="grid grid-cols-8 pt-3 sm:grid-cols-10">
        <div className="col-span-2 hidden sm:block">
          <ul>
            <li className="mt-5 cursor-pointer border-l-2 border-l-yellow-500 px-2 py-2 font-semibold text-yellow-500 transition hover:border-l-yellow-500 hover:text-yellow-500">
              Prerequisites
            </li>
            <Link to="/esignature">
              <li className="mt-5 cursor-pointer border-l-2 border-transparent px-2 py-2 font-semibold transition hover:border-l-yellow-500 hover:text-yellow-500">
                E-Signature Upload
              </li>
            </Link>
          </ul>
        </div>
        <div className="col-span-8 overflow-hidden rounded-xl sm:bg-yellow-100 sm:px-8 sm:shadow-md">
          <div className="pt-4">
            <h1 className="py-2 text-2xl font-semibold">
              Set your form prerequisites here
            </h1>
            <div className="col-span-8 sm:hidden">
              <Dropdown
                label=""
                inline
                dismissOnClick={false}
                renderTrigger={() => (
                  <button
                    id="dropdownActionButton"
                    data-dropdown-toggle="dropdownAction"
                    className="inline-flex w-full py-2.5 items-center bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-3"
                    type="button"
                  >
                    <div className="flex justify-between w-full">
                      <span>Prerequisites</span>
                      <MdKeyboardArrowDown className="h-5 w-5" />
                    </div>
                  </button>
                )}
              >
                <Dropdown.Item as={Link} to="/esignature">
                  E-signature Upload
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>
          <hr className="mt-4 mb-8" />
          <div className="mb-10">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4 sm:grid-cols-1">
                <div>
                  <label
                    htmlFor="unit"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Administrative/Academic Unit{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                      placeholder="Search unit"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    {searchQuery && showDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto">
                        {filteredUnits.map((unit) => (
                          <div
                            key={unit.id}
                            className="px-4 py-2 cursor-pointer hover:bg-yellow-100"
                            onClick={() => handleUnitSelect(unit)}
                          >
                            {unit.mainUnit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="unitType"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <fieldset className="flex max-w-md flex-row gap-4">
                    <div className="flex items-center gap-2">
                      <Radio
                        id="type-academic"
                        name="unitType"
                        value="Academic"
                        className="checked:bg-yellow-500 focus:ring-yellow-500"
                        checked={unitType === "Academic"}
                        readOnly
                      />
                      <Label htmlFor="type-academic">Academic</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio
                        id="type-administrative"
                        name="unitType"
                        value="Administrative"
                        className="checked:bg-yellow-500 focus:ring-yellow-500"
                        checked={unitType === "Administrative"}
                        readOnly
                      />
                      <Label htmlFor="type-administrative">
                        Administrative
                      </Label>
                    </div>
                  </fieldset>
                </div>
                <div className="relative w-full mt-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <label
                        htmlFor="internal-stakeholder"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Internal Client/Stakeholder{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p
                        id="floating_helper_text"
                        className="my-2 text-xs text-gray-500"
                      >
                        Use the "Add" button to include more entries.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addInternalStakeholder}
                      className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-xs font-medium text-center text-white rounded inline-flex items-center"
                      disabled={
                        internalStakeholders[
                          internalStakeholders.length - 1
                        ] === ""
                      }
                    >
                      <FiPlus className="mr-2" />
                      <span>Add</span>
                    </button>
                  </div>
                  {internalStakeholders.map((_, index) => (
                    <div
                      key={index}
                      className="relative flex items-center mb-2"
                    >
                      <input
                        type="text"
                        name={`internal-stakeholder-${index}`}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                        placeholder="e.g. Academic Staff"
                        value={internalStakeholders[index]}
                        onChange={(e) => {
                          const newStakeholders = [...internalStakeholders];
                          newStakeholders[index] = e.target.value;
                          setInternalStakeholders(newStakeholders);
                        }}
                        required
                      />
                      <button
                        onClick={() => {
                          const newStakeholders = [...internalStakeholders];
                          newStakeholders.splice(index, 1);
                          setInternalStakeholders(newStakeholders);
                        }}
                        className={`ml-2 py-1 px-3 rounded ${
                          index === 0
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-red-500 hover:text-red-600"
                        }`}
                        disabled={index === 0}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative w-full mt-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <label
                        htmlFor="external-stakeholder"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        External Client/Stakeholder{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <p
                        id="floating_helper_text"
                        className="my-2 text-xs text-gray-500"
                      >
                        Use the "Add" button to include more entries.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addExternalStakeholder}
                      className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-xs font-medium text-center text-white rounded inline-flex items-center"
                      disabled={
                        externalStakeholders[
                          externalStakeholders.length - 1
                        ] === ""
                      }
                    >
                      <FiPlus className="mr-2" />
                      <span>Add</span>
                    </button>
                  </div>
                  {externalStakeholders.map((_, index) => (
                    <div
                      key={index}
                      className="relative flex items-center mb-2"
                    >
                      <input
                        type="text"
                        name={`external-stakeholder-${index}`}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                        placeholder="e.g. Parents & Guardians"
                        value={externalStakeholders[index]}
                        onChange={(e) => {
                          const newStakeholders = [...externalStakeholders];
                          newStakeholders[index] = e.target.value;
                          setExternalStakeholders(newStakeholders);
                        }}
                        required
                      />
                      <button
                        onClick={() => {
                          const newStakeholders = [...externalStakeholders];
                          newStakeholders.splice(index, 1);
                          setExternalStakeholders(newStakeholders);
                        }}
                        className={`ml-2 py-1 px-3 rounded ${
                          index === 0
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-red-500 hover:text-red-600"
                        }`}
                        disabled={index === 0}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Save all
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prerequisites;
