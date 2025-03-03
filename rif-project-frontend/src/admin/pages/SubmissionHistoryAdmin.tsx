import React, { useEffect, useState, useContext } from "react";
import { Dropdown } from "flowbite-react";
import { MdKeyboardArrowDown } from "react-icons/md";
import AuthContext from "../../auth/AuthContext";
import riskform from "../../assets/riskformthumbnail.jpg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PrintButtonAdmin from "../components/PrintButtonAdmin";

interface RiskFormData {
  id: number;
  submissionDate: string;
  pdfProof: File | null;
  notes: string | null;
}

interface Report {
  id: number;
  riskFormData: RiskFormData[];
  status: string;
  adminComment: string | null;
  approverApproveDate: string | null;
}

interface ReportDetails {
  report: Report;
  prerequisite: Prerequisite;
  unitType: string;
}

interface Prerequisite {
  unit: string;
}

interface RevisionCommentHistory {
  id: number;
  comment: string;
  timestamp: string;
}

const MAX_CHARS = 500;

const SubmissionHistoryAdmin: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [units, setUnits] = useState<{ [key: number]: string }>({});
  const [unitTypes, setUnitTypes] = useState<{ [key: number]: string }>({});
  const [filter, setFilter] = useState<string>("Most Recent");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isAuthenticated, user } = useContext(AuthContext);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedRiskFormData, setSelectedRiskFormData] = useState<
    RiskFormData[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionComment, setRevisionComment] = useState<string>("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [reportToVerify, setReportToVerify] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "FOR_VERIFICATION" | "VERIFIED"
  >("FOR_VERIFICATION");
  const [unitTypeFilter, setUnitTypeFilter] = useState<
    "Academic" | "Administrative" | "All"
  >("All");
  const [revisionHistory, setRevisionHistory] = useState<
    RevisionCommentHistory[]
  >([]);
  const [isRevisionHistoryModalOpen, setIsRevisionHistoryModalOpen] =
    useState(false);

  const handleDisplayChange = (display: "FOR_VERIFICATION" | "VERIFIED") => {
    setSelectedFilter(display);
  };

  useEffect(() => {
    const fetchReports = async () => {
      if (isAuthenticated && user) {
        const token = localStorage.getItem("token");

        try {
          const response = await fetch(
            `http://localhost:8080/api/riskforms/all-reports`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const approvedAndVerifiedReports = data.filter(
            (report: Report) =>
              report.status === "APPROVER_APPROVED" ||
              report.status === "ADMIN_VERIFIED"
          );
          setReports(approvedAndVerifiedReports);
          setFilteredReports(approvedAndVerifiedReports);

          const unitPromises = approvedAndVerifiedReports.map((report) =>
            fetchReportDetails(report.id)
          );
          const unitResults = await Promise.all(unitPromises);
          const unitsMap: { [key: number]: string } = {};
          const unitTypesMap: { [key: number]: string } = {};
          unitResults.forEach((result, index) => {
            if (result) {
              unitsMap[approvedAndVerifiedReports[index].id] = result.unit;
              unitTypesMap[approvedAndVerifiedReports[index].id] =
                result.unitType;
            }
          });
          setUnits(unitsMap);
          setUnitTypes(unitTypesMap);
        } catch (error) {
          console.error("Error fetching reports:", error);
        }
      }
    };

    fetchReports();
  }, [isAuthenticated, user]);

  const fetchReportDetails = async (reportId: number) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/riskforms/reportDetails/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ReportDetails = await response.json();
      return {
        unit: data.prerequisite.unit,
        unitType: data.unitType,
      };
    } catch (error) {
      console.error("Error fetching report details:", error);
      return null;
    }
  };

  useEffect(() => {
    let sortedReports = [...reports];

    if (filter === "Most Recent") {
      sortedReports.sort((a, b) => {
        const dateA = new Date(a.riskFormData[0]?.submissionDate || 0);
        const dateB = new Date(b.riskFormData[0]?.submissionDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (filter === "Oldest") {
      sortedReports.sort((a, b) => {
        const dateA = new Date(a.riskFormData[0]?.submissionDate || 0);
        const dateB = new Date(b.riskFormData[0]?.submissionDate || 0);
        return dateA.getTime() - dateB.getTime();
      });
    }

    if (startDate && endDate) {
      sortedReports = sortedReports.filter((report) => {
        const reportDate = new Date(
          report.riskFormData[0]?.submissionDate || 0
        );
        return reportDate >= startDate && reportDate <= endDate;
      });
    }

    if (searchQuery) {
      sortedReports = sortedReports.filter(
        (report) =>
          report.riskFormData.some((data) =>
            data.submissionDate
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ) ||
          report.id.toString().includes(searchQuery) ||
          (units[report.id] &&
            units[report.id].toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedFilter === "FOR_VERIFICATION") {
      sortedReports = sortedReports.filter(
        (report) => report.status === "APPROVER_APPROVED"
      );
    } else if (selectedFilter === "VERIFIED") {
      sortedReports = sortedReports.filter(
        (report) => report.status === "ADMIN_VERIFIED"
      );
    }

    if (unitTypeFilter !== "All") {
      sortedReports = sortedReports.filter(
        (report) => unitTypes[report.id] === unitTypeFilter
      );
    }

    setFilteredReports(sortedReports);
  }, [
    filter,
    searchQuery,
    reports,
    startDate,
    endDate,
    selectedFilter,
    unitTypeFilter,
    unitTypes,
  ]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const openModal = async (reportId: number) => {
    setSelectedReportId(reportId);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/riskforms/report/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const riskFormDataWithDefaults = data.riskFormData.map(
        (item: RiskFormData) => ({
          ...item,
          fileError: null,
          charCount: item.notes ? item.notes.length : 0,
        })
      );
      setSelectedRiskFormData(riskFormDataWithDefaults);
    } catch (error) {
      console.error("Error fetching risk form data:", error);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReportId(null);
    setSelectedRiskFormData([]);
  };

  const viewPdfProof = async (reportId: number, riskFormDataId: number) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:8080/api/riskforms/report/${reportId}/pdf/${riskFormDataId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl);
    } else {
      console.error("Error fetching PDF proof");
    }
  };

  const verifyReport = async () => {
    if (reportToVerify === null) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/riskforms/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reportId: reportToVerify }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Verify report response:", data); // Debugging log
      // Update the report status in the state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportToVerify
            ? {
                ...report,
                status: "ADMIN_VERIFIED",
              }
            : report
        )
      );
      setFilteredReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportToVerify
            ? {
                ...report,
                status: "ADMIN_VERIFIED",
              }
            : report
        )
      );
      setSuccessMessage(
        "Verification successful. An email notification was sent to the user."
      );
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error verifying report:", error);
    } finally {
      setIsVerifyModalOpen(false);
      setReportToVerify(null);
    }
  };

  const confirmVerifyReport = (reportId: number) => {
    setReportToVerify(reportId);
    setIsVerifyModalOpen(true);
  };

  const cancelVerifyReport = () => {
    setIsVerifyModalOpen(false);
    setReportToVerify(null);
  };

  const confirmMarkForRevision = (reportId: number) => {
    setSelectedReportId(reportId);
    setIsRevisionModalOpen(true);
  };

  const cancelMarkForRevision = () => {
    setIsRevisionModalOpen(false);
    setRevisionComment("");
    setSelectedReportId(null);
  };

  const markReportForRevision = async () => {
    if (selectedReportId === null) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/riskforms/admin-for-revision`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportId: selectedReportId,
            comment: revisionComment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Mark for revision response:", data); // Debugging log
      // Update the report status and comment in the state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === selectedReportId
            ? {
                ...report,
                status: "APPROVER_FOR_REVISION",
                adminComment: revisionComment, // Use adminComment instead of approverComment
              }
            : report
        )
      );
      setFilteredReports((prevReports) =>
        prevReports.map((report) =>
          report.id === selectedReportId
            ? {
                ...report,
                status: "APPROVER_FOR_REVISION",
                adminComment: revisionComment, // Use adminComment instead of approverComment
              }
            : report
        )
      );
      setSuccessMessage(
        "Successfully marked for revision. An email notification was sent to the user."
      );
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error marking report for revision:", error);
    } finally {
      setIsRevisionModalOpen(false);
      setRevisionComment("");
      setSelectedReportId(null);
    }
  };

  const viewRevisionHistory = async (reportId: number) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/riskforms/revision-comments/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRevisionHistory(data);
      setIsRevisionHistoryModalOpen(true);
    } catch (error) {
      console.error("Error fetching revision history:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    console.log("Status Icon for status:", status); // Debugging log
    switch (status) {
      case "APPROVER_APPROVED":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">
            For Verification
          </span>
        );

      case "ADMIN_VERIFIED":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
            Verified
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">Submissions</h2>
        <div className="flex justify-between items-center">
          <p className="text-neutral-500 text-xl mt-3">
            View all unit submissions
          </p>
        </div>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        <div className="flex justify-between">
          <Dropdown
            label=""
            inline
            dismissOnClick={false}
            renderTrigger={() => (
              <button
                id="dropdownActionButton"
                data-dropdown-toggle="dropdownAction"
                className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                type="button"
              >
                Filter
                <MdKeyboardArrowDown className="ml-2 h-5 w-5" />
              </button>
            )}
          >
            <Dropdown.Item onClick={() => handleFilterChange("Most Recent")}>
              Most Recent
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilterChange("Oldest")}>
              Oldest
            </Dropdown.Item>
          </Dropdown>
          <div
            className="ml-2 inline-flex flex-col w-full rounded-md shadow-sm md:w-auto md:flex-row"
            role="group"
          >
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                selectedFilter === "FOR_VERIFICATION"
                  ? "text-green-500 bg-green-100"
                  : "text-green-500 bg-white"
              } border border-gray-200 rounded-t-lg md:rounded-tr-none md:rounded-l-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => handleDisplayChange("FOR_VERIFICATION")}
            >
              For Verification
            </button>

            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                selectedFilter === "VERIFIED"
                  ? "text-blue-500 bg-blue-100"
                  : "text-blue-500 bg-white"
              } border border-gray-200 rounded-b-lg md:rounded-bl-none md:rounded-r-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => handleDisplayChange("VERIFIED")}
            >
              Verified
            </button>
            <button
              type="button"
              className={`px-4 ml-2 py-2 text-sm font-medium ${
                unitTypeFilter === "Academic"
                  ? "text-yellow-500 bg-yellow-100"
                  : "text-gray-500 bg-white"
              } border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => setUnitTypeFilter("Academic")}
            >
              Academic
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                unitTypeFilter === "Administrative"
                  ? "text-yellow-500 bg-yellow-100"
                  : "text-gray-500 bg-white"
              } border-t border-b border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => setUnitTypeFilter("Administrative")}
            >
              Administrative
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                unitTypeFilter === "All"
                  ? "text-yellow-500 bg-yellow-100"
                  : "text-gray-500 bg-white"
              } border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => setUnitTypeFilter("All")}
            >
              All
            </button>
          </div>

          <div className="ml-2 flex flex-col sm:flex-row items-center">
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Select A.Y. start date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5 mb-2 sm:mb-0"
            />
            <span className="mx-4 text-gray-500">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date: Date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="Select A.Y. end date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5"
            />
          </div>
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
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="table-search-users"
            className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by unit"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="grid gap-7 lg:grid-cols-5 p-1 pl-18 relative">
        {filteredReports.map((report, index) => (
          <div
            className="w-full bg-white rounded-lg shadow-md lg:max-w-sm relative"
            key={report.id}
            style={{ cursor: "pointer" }}
          >
            <img
              className="object-cover w-full h-64 rounded-t-lg"
              src={riskform}
              alt="image"
            />
            <div className="p-4 rounded-b-lg">
              <h4 className="text-l font-semibold">
                {units[report.id] || "Loading unit..."}
              </h4>
              <p className="mb-2 leading-normal text-xs">
                Report ID: {report.id}
              </p>
              <div className="flex justify-between">
                <div className="flex">
                  <PrintButtonAdmin reportId={report.id.toString()} />{" "}
                  <p
                    className="mb-2 leading-normal text-xs font-normal"
                    style={{ color: "#2d3748" }}
                  >
                    {report.riskFormData[0]?.submissionDate || "No Date"}
                  </p>
                </div>
                <Dropdown
                  label=""
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <button
                      id="dropdown-button"
                      data-dropdown-toggle="dropdown"
                      className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none "
                      type="button"
                    >
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </button>
                  )}
                >
                  <Dropdown.Item
                    onClick={() => openModal(report.id)}
                    disabled={
                      !report.riskFormData.some((data) => data.pdfProof)
                    }
                    className={
                      !report.riskFormData.some((data) => data.pdfProof)
                        ? "text-gray-400 cursor-not-allowed"
                        : ""
                    }
                  >
                    View Proof
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => viewRevisionHistory(report.id)}>
                    View revision comment history
                  </Dropdown.Item>

                  <Dropdown.Item
                    className={
                      report.status === "ADMIN_VERIFIED"
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-600"
                    }
                    onClick={() => confirmVerifyReport(report.id)}
                    disabled={report.status === "ADMIN_VERIFIED"}
                  >
                    Verify
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-red-600"
                    onClick={() => confirmMarkForRevision(report.id)}
                  >
                    Mark for Revision
                  </Dropdown.Item>
                </Dropdown>
              </div>
              <div className="absolute top-2 right-2">
                {getStatusIcon(report.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verify Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Verification</h2>
            <p className="mb-4">Are you sure you want to verify this report?</p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={cancelVerifyReport}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={verifyReport}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              Leave a Comment for Revision
            </h2>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg"
              rows={5}
              placeholder="Enter your comment here..."
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={cancelMarkForRevision}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={markReportForRevision}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Success</h2>
            <p className="mb-4">{successMessage}</p>
            <div className="flex justify-end">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsSuccessModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          id="crud-modal"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center w-full p-4 bg-black bg-opacity-50"
        >
          <div className="relative w-full max-w-3xl">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  View Proof
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={closeModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-2 md:p-5">
                <div className="max-h-96 px-2 overflow-y-auto">
                  {selectedRiskFormData
                    .filter((data) => data.notes || data.pdfProof)
                    .map((data, index) => (
                      <div key={data.id} className="col-span-1">
                        <div className="flex justify-between">
                          <label className="block mb-2 text-md font-bold text-yellow-600 uppercase">
                            Row {index + 1}
                          </label>
                          <div className="flex items-center">
                            {data.pdfProof && (
                              <button
                                type="button"
                                className="mr-2 mb-4 bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-xs font-medium text-center text-white rounded inline-flex items-center"
                                onClick={() =>
                                  viewPdfProof(selectedReportId!, data.id)
                                }
                              >
                                View PDF
                              </button>
                            )}
                          </div>
                        </div>
                        <textarea
                          name="notes"
                          rows={4}
                          className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Notes"
                          value={data.notes || ""}
                          readOnly
                        ></textarea>
                        <hr className="my-8" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal */}
      {/* Revision History Modal */}
      {isRevisionHistoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              Revision Comment History
            </h2>
            <div className="overflow-y-auto max-h-96">
              {revisionHistory.length > 0 ? (
                revisionHistory.map((comment, index) => (
                  <div key={index} className="mb-4">
                    <p>{comment.comment}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                    <hr className="mt-2" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No revision comments available.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={() => setIsRevisionHistoryModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistoryAdmin;
