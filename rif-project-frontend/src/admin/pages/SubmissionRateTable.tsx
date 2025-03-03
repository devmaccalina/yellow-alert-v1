import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ReportCount {
  academicCount: number;
  administrativeCount: number;
  academicUnitCount: number;
  administrativeUnitCount: number;
}

const SubmissionRateTable: React.FC = () => {
  const [data, setData] = useState<ReportCount>({
    academicCount: 0,
    administrativeCount: 0,
    academicUnitCount: 0,
    administrativeUnitCount: 0,
  });

  const token = localStorage.getItem("token");

  // Calculate default start date as one year ago
  const defaultStartDate = new Date();
  defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate);

  // Calculate default end date as today
  const defaultEndDate = new Date();
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate);

  const fetchCounts = async () => {
    try {
      const academicResponse = await fetch(
        `http://localhost:8080/api/riskforms/unitTypeCount/academic/dateRange?startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!academicResponse.ok) {
        throw new Error(`HTTP error! Status: ${academicResponse.status}`);
      }

      const academicData = await academicResponse.json();

      const administrativeResponse = await fetch(
        `http://localhost:8080/api/riskforms/unitTypeCount/administrative/dateRange?startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!administrativeResponse.ok) {
        throw new Error(`HTTP error! Status: ${administrativeResponse.status}`);
      }

      const administrativeData = await administrativeResponse.json();

      const academicUnitResponse = await fetch(
        "http://localhost:8080/api/prerequisites/unitTypeCount/academic",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!academicUnitResponse.ok) {
        throw new Error(`HTTP error! Status: ${academicUnitResponse.status}`);
      }

      const academicUnitData = await academicUnitResponse.json();

      const administrativeUnitResponse = await fetch(
        "http://localhost:8080/api/prerequisites/unitTypeCount/administrative",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!administrativeUnitResponse.ok) {
        throw new Error(
          `HTTP error! Status: ${administrativeUnitResponse.status}`
        );
      }

      const administrativeUnitData = await administrativeUnitResponse.json();

      setData({
        academicCount: academicData,
        administrativeCount: administrativeData,
        academicUnitCount: academicUnitData,
        administrativeUnitCount: administrativeUnitData,
      });
    } catch (error) {
      console.error("Error fetching report counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [startDate, endDate, token]);

  const calculateSubmissionRate = (
    count: number,
    unitCount: number
  ): string => {
    if (unitCount === 0) return "0.00";
    return ((count / unitCount) * 100).toFixed(2);
  };

  const academicSubmissionRate = calculateSubmissionRate(
    data.academicCount,
    data.academicUnitCount
  );
  const administrativeSubmissionRate = calculateSubmissionRate(
    data.administrativeCount,
    data.administrativeUnitCount
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
          Submission Rate
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
      <div className="flex flex-column items-center justify-end space-y-4 pb-4">
        <div>
          <label
            htmlFor="sdaSelect"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Set Academic Year:
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
      <div id="print-section" className="relative overflow-x-auto">
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Academic Units</h3>
          <table className="w-full text-sm text-left rtl:text-right shadow-md sm:rounded-lg">
            <thead className="text-xs text-white uppercase bg-yellow-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Total Acad Units
                </th>
                <th scope="col" className="px-6 py-3">
                  No. of Submissions
                </th>
                <th scope="col" className="px-6 py-3">
                  Submission Rate
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-yellow-100 border-b text-xl ">
                <td className="px-6 py-6">{data.academicUnitCount}</td>
                <td className="px-6 py-6">{data.academicCount}</td>
                <td className="px-6 py-6 font-medium text-gray-900 whitespace-nowrap">
                  {academicSubmissionRate}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Administrative Units</h3>
          <table className="w-full text-sm text-left rtl:text-right shadow-md sm:rounded-lg">
            <thead className="text-xs text-white uppercase bg-yellow-500">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Total Admin Units
                </th>
                <th scope="col" className="px-6 py-3">
                  No. of Submissions
                </th>
                <th scope="col" className="px-6 py-3">
                  Submission Rate
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-yellow-100 border-b text-xl ">
                <td className="px-6 py-6">{data.administrativeUnitCount}</td>
                <td className="px-6 py-6">{data.administrativeCount}</td>
                <td className="px-6 py-6 font-medium text-gray-900 whitespace-nowrap">
                  {administrativeSubmissionRate}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionRateTable;
