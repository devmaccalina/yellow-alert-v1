import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface RiskParticularDTO {
  description: string;
}

interface RiskFormDataGroupedDTO {
  sdaNumber: number;
  issueParticulars: string;
  riskParticularDescriptions: string[];
  unit: string;
  unitType: string;
  submissionDate: string;
  riskRating: number;
  riskLevel: string;
}

const sdaMapping: { [key: number]: string } = {
  1: "Leadership and Governance",
  2: "Thomasian Identity",
  3: "Teaching and Learning",
  4: "Research and Innovation",
  5: "Resource Management",
  6: "Public Presence",
  7: "Community Development and Advocacy",
  8: "Student Welfare and Services",
  9: "Internationalization",
};

const IdentifiedRisks: React.FC = () => {
  const [data, setData] = useState<RiskFormDataGroupedDTO[]>([]);
  const [selectedSdaNumber, setSelectedSdaNumber] = useState<number | null>(
    null
  );
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [filteredData, setFilteredData] = useState<RiskFormDataGroupedDTO[]>(
    []
  );
  const [sortRiskRatingAsc, setSortRiskRatingAsc] = useState<boolean | null>(
    null
  );
  const [sortRiskLevelAsc, setSortRiskLevelAsc] = useState<boolean | null>(
    null
  );

  const defaultStartDate = new Date();
  defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);

  const defaultEndDate = new Date();
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);

  const [sortUnitAsc, setSortUnitAsc] = useState<boolean | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/riskforms/groupedBySdaNumber",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result: RiskFormDataGroupedDTO[] = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching grouped data:", error);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let filtered = data;
    if (selectedSdaNumber !== null && selectedSdaNumber !== 0) {
      filtered = filtered.filter(
        (item) => item.sdaNumber === selectedSdaNumber
      );
    }
    if (selectedRiskLevel !== "") {
      filtered = filtered.filter(
        (item) => item.riskLevel === selectedRiskLevel
      );
    }
    if (selectedUnit !== "") {
      filtered = filtered.filter((item) => item.unit === selectedUnit);
    }
    if (startDate && endDate) {
      filtered = filtered.filter(
        (item) =>
          new Date(item.submissionDate) >= startDate &&
          new Date(item.submissionDate) <= endDate
      );
    }
    if (sortUnitAsc !== null) {
      filtered.sort((a, b) =>
        sortUnitAsc
          ? a.unit.localeCompare(b.unit)
          : b.unit.localeCompare(a.unit)
      );
    }
    if (sortRiskRatingAsc !== null) {
      filtered.sort((a, b) =>
        sortRiskRatingAsc
          ? a.riskRating - b.riskRating
          : b.riskRating - a.riskRating
      );
    }
    if (sortRiskLevelAsc !== null) {
      filtered.sort((a, b) =>
        sortRiskLevelAsc
          ? riskLevelToNumber(a.riskLevel) - riskLevelToNumber(b.riskLevel)
          : riskLevelToNumber(b.riskLevel) - riskLevelToNumber(a.riskLevel)
      );
    }
    setFilteredData(filtered);
  }, [
    selectedSdaNumber,
    selectedRiskLevel,
    selectedUnit,
    startDate,
    endDate,
    sortUnitAsc,
    sortRiskRatingAsc,
    sortRiskLevelAsc,
    data,
  ]);

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "L":
        return (
          <span className="bg-yellow-300 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-400">
            Low
          </span>
        );
      case "M":
        return (
          <span className="bg-orange-300 text-orange-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-orange-600">
            Medium
          </span>
        );
      case "H":
        return (
          <span className="bg-red-300 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-red-600">
            High
          </span>
        );
      default:
        return null;
    }
  };

  const riskLevelToNumber = (riskLevel: string) => {
    switch (riskLevel) {
      case "L":
        return 1;
      case "M":
        return 2;
      case "H":
        return 3;
      default:
        return 0;
    }
  };

  const renderTable = (
    filteredData: RiskFormDataGroupedDTO[],
    sdaNumber: number
  ) => (
    <>
      <h3 className="text-xl font-bold mb-4">{sdaMapping[sdaNumber]}</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm text-left rtl:text-right shadow-md rounded-lg">
          <thead className="text-xs text-white uppercase bg-yellow-500">
            <tr>
              <th scope="col" className="px-6 py-3 w-3/12">
                Issues
              </th>
              <th scope="col" className="px-6 py-3 w-3/12">
                Risks
              </th>
              <th scope="col" className="px-6 py-3 w-1/12">
                <div className="flex items-center">
                  Risk Rating
                  <button onClick={() => setSortRiskRatingAsc((prev) => !prev)}>
                    <svg
                      className="w-3 h-3 ms-1.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                  </button>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 w-1/12">
                <div className="flex items-center">
                  Risk Level
                  <button onClick={() => setSortRiskLevelAsc((prev) => !prev)}>
                    <svg
                      className="w-3 h-3 ms-1.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                  </button>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 w-2/12">
                <div className="flex items-center">
                  Units
                  <button onClick={() => setSortUnitAsc((prev) => !prev)}>
                    <svg
                      className="w-3 h-3 ms-1.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                    </svg>
                  </button>
                </div>
              </th>
              <th scope="col" className="hidden px-6 py-3">
                Submission Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="bg-yellow-100 border-b border-yellow-300"
                >
                  <td className="px-6 py-4 text-gray-900 break-words whitespace-normal">
                    {item.issueParticulars}
                  </td>
                  <td className="px-6 py-4 text-gray-900 break-words whitespace-normal">
                    <ul className="list-disc list-inside">
                      {item.riskParticularDescriptions.map(
                        (desc, descIndex) => (
                          <li key={descIndex}>{desc}</li>
                        )
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4 text-gray-900 break-words whitespace-normal">
                    {item.riskRating}
                  </td>
                  <td className="px-6 py-4 font-medium break-words whitespace-normal">
                    {getRiskLevelBadge(item.riskLevel)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 break-words whitespace-normal">
                    {item.unit}
                  </td>
                  <td className="hidden px-6 py-4 text-gray-900 break-words whitespace-normal">
                    {item.submissionDate}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-yellow-100 border-b">
                <td colSpan={5} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const handlePrint = () => {
    const printContents = document.getElementById("print-section")!.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Identified Risks
        </h2>
        <div className="flex justify-between items-center">
          <p className="text-neutral-500 text-xl mt-3">
            Risk Identification Form
          </p>
          <button
            onClick={handlePrint}
            className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Print
          </button>
        </div>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <label
            htmlFor="sdaSelect"
            className="block text-sm font-medium text-gray-700"
          >
            Select SDA:
          </label>
          <select
            id="sdaSelect"
            value={selectedSdaNumber ?? ""}
            onChange={(e) => setSelectedSdaNumber(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          >
            <option value="" disabled>
              Select SDA
            </option>
            <option value={0}>All</option>
            {Object.keys(sdaMapping).map((key) => (
              <option key={key} value={key}>
                {sdaMapping[Number(key)]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="riskLevelSelect"
            className="block text-sm font-medium text-gray-700"
          >
            Select Risk Level:
          </label>
          <select
            id="riskLevelSelect"
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="L">Low</option>
            <option value="M">Medium</option>
            <option value="H">High</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="unitSelect"
            className="block text-sm font-medium text-gray-700"
          >
            Select Unit:
          </label>
          <select
            id="unitSelect"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          >
            <option value="">All</option>
            {Array.from(new Set(data.map((item) => item.unit))).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-column items-center justify-between space-y-4 pb-4">
          <div>
            <label
              htmlFor="dateRange"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Set Date Range:
            </label>
            <div className="flex flex-column items-center ">
              <div className="flex items-center">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Select start date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                <span className="mx-4 text-gray-500">to</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="Select end date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="print-section">
        {selectedSdaNumber !== null && selectedSdaNumber !== 0
          ? renderTable(filteredData, selectedSdaNumber)
          : Object.keys(sdaMapping).map((key) =>
              renderTable(
                filteredData.filter((item) => item.sdaNumber === Number(key)),
                Number(key)
              )
            )}
      </div>
    </div>
  );
};

export default IdentifiedRisks;
