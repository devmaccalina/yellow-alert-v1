import React, { useState, useEffect, useRef } from "react";
import "tailwindcss/tailwind.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface PrerequisiteDataDTO {
  unit: string;
  unitType: string;
  riskLevel: string;
  submissionDate: string;
  riskType: string;
}

const IdentifiedRisksHistorical: React.FC = () => {
  const [data, setData] = useState<PrerequisiteDataDTO[]>([]);
  const [selectedSdaNumber, setSelectedSdaNumber] = useState<number | null>(
    null
  );
  const [selectedSdaText, setSelectedSdaText] = useState<string>("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setFullYear(new Date().getFullYear() - 5))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const token = localStorage.getItem("token");
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSdaNumber !== null) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/riskforms/dataBySdaNumber/${selectedSdaNumber}`,
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
      }
    };

    fetchData();
  }, [selectedSdaNumber, token, startDate, endDate]);

  const processData = (unitType: string) => {
    const filteredData = data.filter((item) => {
      return (
        item.unitType === unitType &&
        (selectedRiskLevel === "" || item.riskLevel === selectedRiskLevel) &&
        (selectedUnit === "" || item.unit === selectedUnit)
      );
    });

    const groupedData = filteredData.reduce(
      (
        acc: {
          [key: string]: { L: number; M: number; H: number };
        },
        item
      ) => {
        const year = new Date(item.submissionDate).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = { L: 0, M: 0, H: 0 };
        }
        acc[year][item.riskLevel as "L" | "M" | "H"] += 1;
        return acc;
      },
      {}
    );

    const labels = Object.keys(groupedData);
    const lowRiskData = Object.values(groupedData).map((d) => d.L);
    const mediumRiskData = Object.values(groupedData).map((d) => d.M);
    const highRiskData = Object.values(groupedData).map((d) => d.H);

    return {
      labels,
      datasets: [
        {
          type: "bar" as const,
          label: "Low Risk",
          data: lowRiskData,
          backgroundColor: "rgba(255,227,139,0.6)",
          borderWidth: 1,
          datalabels: {
            anchor: "end",
            align: "top",
          },
        },
        {
          type: "bar" as const,
          label: "Medium Risk",
          data: mediumRiskData,
          backgroundColor: "rgba(252,168,32,0.6)",
          borderWidth: 1,
          datalabels: {
            anchor: "end",
            align: "top",
          },
        },
        {
          type: "bar" as const,
          label: "High Risk",
          data: highRiskData,
          backgroundColor: "rgba(255,0,0,0.6)",
          borderWidth: 1,
          datalabels: {
            anchor: "end",
            align: "top",
          },
        },
        {
          type: "line" as const,
          label: "Low Risk Trend",
          data: lowRiskData,
          borderColor: "rgba(255,227,139,255)",
          borderWidth: 2,
          fill: false,
          datalabels: {
            display: false,
          },
        },
        {
          type: "line" as const,
          label: "Medium Risk Trend",
          data: mediumRiskData,
          borderColor: "rgba(252,168,32,255)",
          borderWidth: 2,
          fill: false,
          datalabels: {
            display: false,
          },
        },
        {
          type: "line" as const,
          label: "High Risk Trend",
          data: highRiskData,
          borderColor: "rgba(255,0,0,255)",
          borderWidth: 2,
          fill: false,
          datalabels: {
            display: false,
          },
        },
      ],
    };
  };

  const academicChartData = processData("Academic");
  const administrativeChartData = processData("Administrative");

  const handleDownloadImage = () => {
    if (chartRef.current) {
      const chartElement = chartRef.current;
      html2canvas(chartElement).then((canvas) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleSdaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = Number(e.target.value);
    setSelectedSdaNumber(selectedValue);
    const selectedText = e.target.options[e.target.selectedIndex].text;
    setSelectedSdaText(selectedText);
  };

  const handleRiskLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRiskLevel(e.target.value);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUnit(e.target.value);
  };

  const options = {
    plugins: {
      datalabels: {
        display: true,
        color: "black",
        align: "end",
        anchor: "end",
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
      },
    },
  };

  const selectedUnitType = data.find(
    (item) => item.unit === selectedUnit
  )?.unitType;

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Identified Risks per SDA (Historical)
        </h2>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 mt-8 text-white font-bold py-2 px-4 rounded"
          onClick={handleDownloadImage}
        >
          Download Chart
        </button>
      </div>

      <hr className="h-px my-8 border-yellow-500 border-2" />

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
            onChange={handleSdaChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          >
            <option value="" disabled>
              Select SDA
            </option>
            <option value={1}>Leadership and Governance</option>
            <option value={2}>Thomasian Identity</option>
            <option value={3}>Teaching and Learning</option>
            <option value={4}>Research and Innovation</option>
            <option value={5}>Resource Management</option>
            <option value={6}>Public Presence</option>
            <option value={7}>Community Development and Advocacy</option>
            <option value={8}>Student Welfare and Services</option>
            <option value={9}>Internationalization</option>
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
            onChange={handleRiskLevelChange}
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
            onChange={handleUnitChange}
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
              Set Academic Year:
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

      <div ref={chartRef} className="overflow-x-auto">
        {(!selectedUnit || selectedUnitType === "Academic") && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Academic Unit(s)</h3>
            <Chart type="bar" data={academicChartData} options={options} />
          </div>
        )}
        {(!selectedUnit || selectedUnitType === "Administrative") && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Administrative Unit(s)</h3>
            <Chart
              type="bar"
              data={administrativeChartData}
              options={options}
            />
          </div>
        )}

        <table className="hidden w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-yellow-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                Unit Type
              </th>
              <th scope="col" className="px-6 py-3">
                Risk Level
              </th>
              <th scope="col" className="px-6 py-3">
                Submission Date
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-100">
                  <td className="px-6 py-4 text-gray-900 break-words whitespace-normal">
                    {item.unitType}
                  </td>
                  <td className="px-6 py-4 text-gray-900 break-words whitespace-normal">
                    {item.riskLevel}
                  </td>
                  <td className="px-6 py-4 text-gray-900 break-words whitespace-normal">
                    {item.submissionDate}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IdentifiedRisksHistorical;
