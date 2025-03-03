import React, { useState, useEffect, useRef } from "react";
import "tailwindcss/tailwind.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

interface PrerequisiteDataDTO {
  unitType: string;
  riskLevel: string;
  submissionDate: string;
  riskType: string; // Added riskType to differentiate between Initial and Residual risks
}

const RiskComparisonChart: React.FC = () => {
  const [data, setData] = useState<PrerequisiteDataDTO[]>([]);
  const [selectedUnitType, setSelectedUnitType] = useState<string>("Academic");
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

  const processData = () => {
    const filteredData = data.filter(
      (item) => item.unitType === selectedUnitType
    );

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) =>
      (startYear + i).toString()
    );

    const groupedData = years.reduce((acc, year) => {
      acc[year] = {
        Initial: { L: 0, M: 0, H: 0 },
        Residual: { L: 0, M: 0, H: 0 },
      };
      return acc;
    }, {} as { [key: string]: { [key: string]: { L: number; M: number; H: number } } });

    filteredData.forEach((item) => {
      const year = new Date(item.submissionDate).getFullYear().toString();
      if (groupedData[year] && groupedData[year][item.riskType]) {
        groupedData[year][item.riskType][
          item.riskLevel as "L" | "M" | "H"
        ] += 1;
      }
    });

    const chartsData = years.reverse().map((year) => {
      const initialLowRiskData = groupedData[year].Initial.L;
      const initialMediumRiskData = groupedData[year].Initial.M;
      const initialHighRiskData = groupedData[year].Initial.H;

      const residualLowRiskData = groupedData[year].Residual.L;
      const residualMediumRiskData = groupedData[year].Residual.M;
      const residualHighRiskData = groupedData[year].Residual.H;

      return {
        year,
        initialData: {
          labels: ["Low", "Medium", "High"],
          datasets: [
            {
              label: "Initial Risks",
              data: [
                initialLowRiskData,
                initialMediumRiskData,
                initialHighRiskData,
              ],
              backgroundColor: [
                "rgba(255,227,139,0.6)",
                "rgba(252,168,32,0.6)",
                "rgba(255,0,0,0.6)",
              ],
            },
          ],
        },
        residualData: {
          labels: ["Low", "Medium", "High"],
          datasets: [
            {
              label: "Residual Risks",
              data: [
                residualLowRiskData,
                residualMediumRiskData,
                residualHighRiskData,
              ],
              backgroundColor: [
                "rgba(255,227,139,0.6)",
                "rgba(252,168,32,0.6)",
                "rgba(255,0,0,0.6)",
              ],
            },
          ],
        },
      };
    });

    return chartsData;
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

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Risk Comparison (Initial vs Residual)
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
          >
            <option value="Academic">Academic</option>
            <option value="Administrative">Administrative</option>
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
        <h3 className="text-2xl font-bold mb-4">{selectedUnitType}</h3>
        {chartData.map((chart) => (
          <div key={chart.year} className="mb-8">
            <h3 className="text-xl font-bold mb-4">{`${chart.year}`}</h3>
            <div className="flex justify-around">
              <div>
                <h4 className="font-bold mb-2">Initial Risks</h4>
                <Chart type="bar" data={chart.initialData} />
              </div>
              <div>
                <h4 className="font-bold mb-2">Residual Risks</h4>
                <Chart type="bar" data={chart.residualData} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskComparisonChart;
