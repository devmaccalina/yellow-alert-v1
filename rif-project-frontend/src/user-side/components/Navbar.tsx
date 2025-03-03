import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RiArrowDropDownLine } from "react-icons/ri";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import AuthContext from "../../auth/AuthContext";
import yellowalert from "../../assets/yellowalert.png";

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const Navbar: React.FC = () => {
  const { isAuthenticated, user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPrerequisiteComplete, setIsPrerequisiteComplete] = useState(false);
  const [isEsignatureComplete, setIsEsignatureComplete] = useState(false);
  const [isApproverDetailsComplete, setIsApproverDetailsComplete] =
    useState(false);
  const [isRiskDataVisualizationOpen, setIsRiskDataVisualizationOpen] =
    useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");

      const fetchNotifications = async () => {
        try {
          const res = await fetch("http://localhost:8080/api/notifications", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setNotifications(data);
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }
      };

      const fetchUnreadCount = async () => {
        try {
          const res = await fetch(
            "http://localhost:8080/api/notifications/unread-count",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const count = await res.json();
          setUnreadCount(count);
        } catch (err) {
          console.error("Error fetching unread notifications count:", err);
        }
      };

      const fetchPrerequisiteStatus = async () => {
        try {
          const res = await fetch(
            "http://localhost:8080/api/prerequisites/status",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setIsPrerequisiteComplete(data);
          } else {
            console.error("Failed to fetch prerequisite status");
          }
        } catch (err) {
          console.error("Error fetching prerequisite status:", err);
        }
      };

      const fetchEsignatureStatus = async () => {
        try {
          const res = await fetch(
            "http://localhost:8080/api/esignatures/status",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setIsEsignatureComplete(data);
          } else {
            console.error("Failed to fetch e-signature status");
          }
        } catch (err) {
          console.error("Error fetching e-signature status:", err);
        }
      };

      const fetchApproverDetailsStatus = async () => {
        try {
          const res = await fetch(
            "http://localhost:8080/api/approvers/status",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setIsApproverDetailsComplete(data);
          } else {
            console.error("Failed to fetch approver details status");
          }
        } catch (err) {
          console.error("Error fetching approver details status:", err);
        }
      };

      fetchNotifications();
      fetchUnreadCount();
      fetchPrerequisiteStatus();
      fetchEsignatureStatus();
      fetchApproverDetailsStatus();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const markNotificationAsRead = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8080/api/notifications/mark-as-read/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await res.text();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prevCount) => prevCount - 1);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const roleMapping: { [key: string]: string } = {
    ROLE_USER: "User",
    ROLE_APPROVER: "Approver",
    ROLE_AUDITOR: "Auditor",
    ROLE_ADMIN: "Administrator",
  };

  const displayRole = roleMapping[role] || "Unknown Role";

  if (role === "ROLE_ADMIN") {
    return null;
  }

  const getUserInitials = () => {
    if (user && user.firstname && user.lastname) {
      return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
    }
    return "";
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleRiskDataVisualization = () => {
    setIsRiskDataVisualizationOpen(!isRiskDataVisualizationOpen);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleDisabledClick = () => {
    alert("Please complete the prerequisites and e-signature first.");
  };

  const handleApproverDisabledClick = () => {
    alert("Please complete the approver details first.");
  };

  return (
    <>
      <nav
        style={{ backgroundColor: "#121212" }}
        className="fixed w-full z-20 top-0 start-0"
      >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src={yellowalert} className="h-8 me-1" alt="FlowBite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-yellow-500">
              YellowAlert
            </span>
          </a>

          <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {isAuthenticated && user && (
              <>
                <Dropdown
                  label={
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faBell}
                        className="text-white w-5 h-5 cursor-pointer mr-3"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  }
                  arrowIcon={false}
                  inline
                >
                  <Dropdown.Header>
                    <span className="block text-sm text-yellow-500 uppercase">
                      Notifications
                    </span>
                  </Dropdown.Header>
                  <div className="max-h-60 overflow-y-auto">
                    {" "}
                    {/* Add a max height and overflow for the notifications */}
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <Dropdown.Item
                          key={notification.id}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className={
                            !notification.isRead ? "bg-yellow-100" : ""
                          }
                        >
                          <div>
                            <div>{notification.message}</div>
                            <div className="text-xs flex justify-left text-gray-400">
                              {formatDate(notification.timestamp)}
                            </div>
                          </div>
                        </Dropdown.Item>
                      ))
                    ) : (
                      <Dropdown.Item>No notifications</Dropdown.Item>
                    )}
                  </div>
                </Dropdown>

                <Dropdown
                  label={
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-yellow-500 rounded-full">
                      {getUserInitials()}
                    </div>
                  }
                  arrowIcon={false}
                  inline
                >
                  <Dropdown.Header>
                    <span className="block text-sm text-yellow-500 uppercase">
                      {displayRole}
                    </span>
                    <span className="block text-sm">{`${user.firstname} ${user.lastname}`}</span>
                    <span className="block truncate text-sm font-medium">
                      {user.email}
                    </span>
                  </Dropdown.Header>
                  <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
                </Dropdown>
              </>
            )}

            <button
              type="button"
              onClick={toggleDrawer}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-controls="navbar-user"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul
              style={{ backgroundColor: "#121212" }}
              className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0"
            >
              <li>
                <Link
                  to="/"
                  className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                >
                  Home
                </Link>
              </li>
              {isAuthenticated && role === "ROLE_USER" && (
                <>
                  <li>
                    <Link
                      to="/prerequisites"
                      className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                    >
                      Prerequisites
                    </Link>
                  </li>

                  <li>
                    {isPrerequisiteComplete && isEsignatureComplete ? (
                      <Link
                        to="/form"
                        className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                      >
                        Form
                      </Link>
                    ) : (
                      <span
                        className="block py-2 px-3 text-gray-400 cursor-not-allowed md:p-0"
                        onClick={handleDisabledClick}
                      >
                        Form
                      </span>
                    )}
                  </li>
                  <li>
                    {isPrerequisiteComplete && isEsignatureComplete ? (
                      <Link
                        to="/submissions"
                        className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                      >
                        Submissions
                      </Link>
                    ) : (
                      <span
                        className="block py-2 px-3 text-gray-400 cursor-not-allowed md:p-0"
                        onClick={handleDisabledClick}
                      >
                        Submissions
                      </span>
                    )}
                  </li>
                  <li>
                    {isPrerequisiteComplete && isEsignatureComplete ? (
                      <Dropdown
                        label={
                          <span className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0 flex items-center">
                            Risk Data Visualization
                            <RiArrowDropDownLine className="h-6 w-6 text-white" />
                          </span>
                        }
                        arrowIcon={false}
                        inline
                      >
                        <Dropdown.Item>
                          <Link
                            to="/identifiedriskshistoricaluser"
                            className="text-gray-700 block px-2 py-2 text-sm hover:bg-gray-100"
                          >
                            Identified Risks per SDA
                          </Link>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Link
                            to="/sdacomparisonchartuser"
                            className="text-gray-700 block px-2 py-2 text-sm hover:bg-gray-100"
                          >
                            Identified Risks per SDA Summary
                          </Link>
                        </Dropdown.Item>
                      </Dropdown>
                    ) : (
                      <span
                        className="block py-2 px-3 text-gray-400 rounded cursor-not-allowed flex items-center md:p-0"
                        onClick={handleDisabledClick}
                      >
                        Risk Data Visualization
                        <RiArrowDropDownLine className="h-6 w-6 text-gray-400" />
                      </span>
                    )}
                  </li>

                  <li>
                    <Link
                      to="/faqs"
                      className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                    >
                      FAQs
                    </Link>
                  </li>
                </>
              )}
              {isAuthenticated && role === "ROLE_APPROVER" && (
                <>
                  <li>
                    <Link
                      to="approverdetails"
                      className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                    >
                      Approver Details
                    </Link>
                  </li>
                  <li>
                    {isApproverDetailsComplete ? (
                      <Link
                        to="submissionhistoryapprover"
                        className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                      >
                        Submissions
                      </Link>
                    ) : (
                      <span
                        className="block py-2 md:p-0 px-3 text-gray-400 cursor-not-allowed"
                        onClick={handleApproverDisabledClick}
                      >
                        Submissions
                      </span>
                    )}
                  </li>
                  <li>
                    {isApproverDetailsComplete ? (
                      <Dropdown
                        label={
                          <span className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0 flex items-center">
                            Risk Data Visualization
                            <RiArrowDropDownLine className="h-6 w-6 text-white" />
                          </span>
                        }
                        arrowIcon={false}
                        inline
                      >
                        <Dropdown.Item>
                          <Link
                            to="identifiedriskshistoricalapprover"
                            className="text-gray-700 block px-2 py-2 text-sm hover:bg-gray-100"
                          >
                            Identified Risks per SDA
                          </Link>
                        </Dropdown.Item>
                        <Dropdown.Item>
                          <Link
                            to="sdacomparisonchartapprover"
                            className="text-gray-700 block px-2 py-2 text-sm hover:bg-gray-100"
                          >
                            Identified Risks per SDA Summary
                          </Link>
                        </Dropdown.Item>
                      </Dropdown>
                    ) : (
                      <span
                        className="block py-2 px-3 text-gray-400 rounded cursor-not-allowed flex items-center md:p-0"
                        onClick={handleApproverDisabledClick}
                      >
                        Risk Data Visualization
                        <RiArrowDropDownLine className="h-6 w-6 text-gray-400" />
                      </span>
                    )}
                  </li>
                  <li>
                    <Link
                      to="faqs"
                      className="block py-2 px-3 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-yellow-500 md:p-0"
                    >
                      FAQs
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div
        id="drawer-navigation"
        className={`fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform bg-white w-64 dark:bg-gray-800 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } sm:hidden`}
        tabIndex={-1}
        aria-labelledby="drawer-navigation-label"
      >
        <h5
          id="drawer-navigation-label"
          className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
        >
          Menu
        </h5>
        <button
          type="button"
          onClick={toggleDrawer}
          aria-controls="drawer-navigation"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
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
          <span className="sr-only">Close menu</span>
        </button>
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                to="/"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <span className="ms-3">Home</span>
              </Link>
            </li>
            {isAuthenticated && role === "ROLE_USER" && (
              <>
                <li>
                  <Link
                    to="/prerequisites"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="ms-3">Prerequisites</span>
                  </Link>
                </li>

                <li>
                  {isPrerequisiteComplete && isEsignatureComplete ? (
                    <Link
                      to="/form"
                      className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                      <span className="ms-3">Form</span>
                    </Link>
                  ) : (
                    <span
                      className="flex items-center p-2 text-gray-400 rounded-lg cursor-not-allowed"
                      onClick={handleDisabledClick}
                    >
                      <span className="ms-3">Form</span>
                    </span>
                  )}
                </li>
                <li>
                  {isPrerequisiteComplete && isEsignatureComplete ? (
                    <Link
                      to="/submissions"
                      className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                      <span className="ms-3">Submissions</span>
                    </Link>
                  ) : (
                    <span
                      className="flex items-center p-2 text-gray-400 rounded-lg cursor-not-allowed"
                      onClick={handleDisabledClick}
                    >
                      <span className="ms-3">Submissions</span>
                    </span>
                  )}
                </li>
                <li>
                  {isPrerequisiteComplete && isEsignatureComplete ? (
                    <button
                      type="button"
                      className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      aria-controls="dropdown-example"
                      data-collapse-toggle="dropdown-example"
                      onClick={toggleRiskDataVisualization}
                    >
                      <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                        Risk Data Visualization
                      </span>
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>
                  ) : (
                    <span
                      className="flex items-center w-full p-2 text-base text-gray-400 transition duration-75 rounded-lg cursor-not-allowed"
                      onClick={handleDisabledClick}
                    >
                      <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                        Risk Data Visualization
                      </span>
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </span>
                  )}
                  <ul
                    id="dropdown-example"
                    className={`py-2 space-y-2 ${
                      isRiskDataVisualizationOpen ? "block" : "hidden"
                    }`}
                  >
                    <li>
                      {isPrerequisiteComplete && isEsignatureComplete ? (
                        <Link
                          to="/identifiedriskshistoricaluser"
                          className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        >
                          Identified Risks per SDA
                        </Link>
                      ) : (
                        <span
                          className="flex items-center w-full p-2 text-gray-400 transition duration-75 rounded-lg pl-11 cursor-not-allowed"
                          onClick={handleDisabledClick}
                        >
                          Identified Risks per SDA
                        </span>
                      )}
                    </li>
                    <li>
                      {isPrerequisiteComplete && isEsignatureComplete ? (
                        <Link
                          to="/sdacomparisonchartuser"
                          className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                        >
                          Identified Risks per SDA Summary
                        </Link>
                      ) : (
                        <span
                          className="flex items-center w-full p-2 text-gray-400 transition duration-75 rounded-lg pl-11 cursor-not-allowed"
                          onClick={handleDisabledClick}
                        >
                          Identified Risks per SDA Summary
                        </span>
                      )}
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    to="/faqs"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="ms-3">FAQs</span>
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && role === "ROLE_APPROVER" && (
              <>
                <li>
                  <Link
                    to="approverdetails"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="ms-3">Approver Details</span>
                  </Link>
                </li>
                <li>
                  {isApproverDetailsComplete ? (
                    <Link
                      to="submissionhistoryapprover"
                      className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                      <span className="ms-3">Submissions</span>
                    </Link>
                  ) : (
                    <span
                      className="flex items-center p-2 text-gray-400 rounded-lg cursor-not-allowed"
                      onClick={handleApproverDisabledClick}
                    >
                      <span className="ms-3">Submissions</span>
                    </span>
                  )}
                </li>
                <li>
                  <Link
                    to="faqs"
                    className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                  >
                    <span className="ms-3">FAQs</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
