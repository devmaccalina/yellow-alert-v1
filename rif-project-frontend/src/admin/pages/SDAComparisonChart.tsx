import React, { useState, useEffect, useRef } from "react";
import "tailwindcss/tailwind.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PrerequisiteDataDTO {
  unit: string;
  unitType: string;
  sdaNumber: number;
  riskLevel: string;
  submissionDate: string;
  riskType: string;
}

const SDAComparisonChart: React.FC = () => {
  const [data, setData] = useState<PrerequisiteDataDTO[]>([]);
  const [selectedUnitType, setSelectedUnitType] = useState<string>("Academic");
  const [selectedUnit, setSelectedUnit] = useState<string>("All");
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setFullYear(new Date().getFullYear() - 5))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const token = localStorage.getItem("token");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/riskforms/allData",
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

        const result: PrerequisiteDataDTO[] = await response.json();
        const filteredResult = result.filter((item) => {
          const submissionDate = new Date(item.submissionDate);
          return submissionDate >= startDate && submissionDate <= endDate;
        });
        setData(filteredResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token, startDate, endDate]);

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

  const fixedColors = [
    "rgba(255, 99, 132, 0.6)", // Red
    "rgba(54, 162, 235, 0.6)", // Blue
    "rgba(255, 206, 86, 0.6)", // Yellow
    "rgba(75, 192, 192, 0.6)", // Green
    "rgba(0, 128, 128, 0.6)", // Teal
    "rgba(255, 159, 64, 0.6)", // Orange
    "rgba(199, 199, 199, 0.6)", // Grey
    "rgba(255, 205, 86, 0.6)", // Yellow
    "rgba(54, 162, 235, 0.6)", // Blue
  ];

  const processData = () => {
    const filteredData = data.filter(
      (item) =>
        (selectedUnitType === "All" || item.unitType === selectedUnitType) &&
        (selectedUnit === "All" || item.unit === selectedUnit)
    );

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) =>
      (startYear + i).toString()
    );

    const groupedData = years.reduce((acc, year) => {
      acc[year] = Object.keys(sdaMapping).reduce((sdaAcc, sdaNumber) => {
        sdaAcc[sdaNumber as any] = 0;
        return sdaAcc;
      }, {} as { [key: string]: number });
      return acc;
    }, {} as { [key: string]: { [key: string]: number } });

    filteredData.forEach((item) => {
      const year = new Date(item.submissionDate).getFullYear().toString();
      if (groupedData[year]) {
        groupedData[year][item.sdaNumber] += 1;
      }
    });

    const labels = years;
    const datasets = Object.keys(sdaMapping).map((sdaNumber, index) => ({
      label: sdaMapping[parseInt(sdaNumber)],
      data: labels.map((year) => groupedData[year][sdaNumber]),
      backgroundColor: fixedColors[index % fixedColors.length],
    }));

    const totalSdaCounts = Object.keys(sdaMapping).map((sdaNumber) => ({
      sdaNumber: parseInt(sdaNumber),
      count: filteredData.filter(
        (item) => item.sdaNumber === parseInt(sdaNumber)
      ).length,
    }));

    totalSdaCounts.sort((a, b) => b.count - a.count);
    const topThreeSdas = totalSdaCounts
      .slice(0, 3)
      .map((item) => item.sdaNumber);

    const lineDatasets = topThreeSdas.map((sdaNumber, index) => ({
      type: "line" as const,
      label: `${sdaMapping[sdaNumber]} Trend`,
      data: labels.map((year) => groupedData[year][sdaNumber]),
      borderColor: fixedColors[index % fixedColors.length],
      borderWidth: 2,
      fill: false,
    }));

    return { labels, datasets: [...datasets, ...lineDatasets] };
  };

  const chartData = processData();

  const handleDownloadImage = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    setSelectedUnit(selectedUnit);
    if (selectedUnit === "All") {
      setSelectedUnitType("All");
    } else {
      const unitType = data.find(
        (item) => item.unit === selectedUnit
      )?.unitType;
      if (unitType) {
        setSelectedUnitType(unitType);
      }
    }
  };

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Identified Risks per SDA Summary (Historical)
        </h2>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 mt-8 text-white font-bold py-2 px-4 rounded"
          onClick={handleDownloadImage}
        >
          Download Chart
        </button>
      </div>

      <hr className="h-px my-8 border-yellow-500 border-2" />

      <div className="flex mb-8">
        <div>
          <label
            htmlFor="unitTypeSelect"
            className="block text-sm font-medium text-gray-700"
          >
            Select Unit Type:
          </label>
          <select
            id="unitTypeSelect"
            value={selectedUnitType}
            onChange={(e) => setSelectedUnitType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            disabled={selectedUnit !== "All"}
          >
            <option value="All">All</option>
            <option value="Academic">Academic</option>
            <option value="Administrative">Administrative</option>
          </select>
        </div>
        <div className="ml-4">
          <label
            htmlFor="unitSelect"
            className="block text-sm font-medium text-gray-700"
          >
            Select Unit:
          </label>
          <select
            id="unitSelect"
            value={selectedUnit}
            onChange={handleUnitChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          >
            <option value="All">All</option>
            {Array.from(new Set(data.map((item) => item.unit))).map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-4 flex flex-column items-center justify-between space-y-4 pb-4">
          <div>
            <label
              htmlFor="dateRange"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Set Date Range:
            </label>
            <div className="flex flex-column items-center">
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

      <div ref={chartRef} id="print-section" className="overflow-x-auto">
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{`${selectedUnitType} Unit(s)`}</h3>
          <Chart type="bar" data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default SDAComparisonChart;
