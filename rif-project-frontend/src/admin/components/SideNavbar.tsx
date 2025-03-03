import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import AuthContext from "../../auth/AuthContext";
import yellowalert from "../../assets/yellowalert.png";
import { MdDashboard } from "react-icons/md";
import { IoDocumentsSharp, IoPieChartSharp } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const SideNavbar: React.FC = () => {
  const { isAuthenticated, user, displayRole, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [isRiskDataVisualizationOpen, setIsRiskDataVisualizationOpen] =
    useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:8080/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setNotifications(data);
        })
        .catch((err) => console.error("Error fetching notifications:", err));

      fetch("http://localhost:8080/api/notifications/unread-count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((count) => {
          setUnreadCount(count);
        })
        .catch((err) =>
          console.error("Error fetching unread notifications count:", err)
        );
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const markNotificationAsRead = (id: number) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8080/api/notifications/mark-as-read/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
      })
      .then(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount((prevCount) => prevCount - 1);
      })
      .catch((err) =>
        console.error("Error marking notification as read:", err)
      );
  };

  const getUserInitials = () => {
    if (user && user.firstname && user.lastname) {
      return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
    }
    return "";
  };

  const toggleRiskDataVisualization = () => {
    setIsRiskDataVisualizationOpen(!isRiskDataVisualizationOpen);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      <nav
        style={{ backgroundColor: "#121212" }}
        className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                onClick={toggleDrawer}
                aria-controls="drawer-navigation"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
              <Link to="/admin" className="flex ms-2 md:me-24">
                <img
                  src={yellowalert}
                  className="h-8 me-3"
                  alt="FlowBite Logo"
                />
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-yellow-500">
                  YellowAlert
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex items-center ms-3">
                {isAuthenticated && user ? (
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
                      <div
                        className="overflow-y-auto"
                        style={{ maxHeight: "200px" }}
                      >
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
                      <Dropdown.Item onClick={handleLogout}>
                        Sign out
                      </Dropdown.Item>
                    </Dropdown>
                  </>
                ) : (
                  <Dropdown
                    label={
                      <button className="py-2 px-4 text-white rounded bg-yellow-500">
                        Login
                      </button>
                    }
                    arrowIcon={false}
                    inline
                  >
                    <Dropdown.Item>
                      <Link to="/login" className="block w-full text-left">
                        Login
                      </Link>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Link to="/register" className="block w-full text-left">
                        Register
                      </Link>
                    </Dropdown.Item>
                  </Dropdown>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isAuthenticated && (
        <aside
          id="logo-sidebar"
          className="hidden sm:block fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
            <ul className="space-y-2 font-medium">
              <li>
                <Link
                  to="submissions"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                >
                  <IoDocumentsSharp className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Submissions
                  </span>
                </Link>
              </li>

              <li>
                <Link
                  to="users"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Users</span>
                </Link>
              </li>
              <li>
                <Link
                  to="units"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    height="1em"
                    width="1em"
                  >
                    <path
                      fill="currentColor"
                      d="M0 16h8V0H0v16zM5 2h2v2H5V2zm0 4h2v2H5V6zm0 4h2v2H5v-2zM1 2h2v2H1V2zm0 4h2v2H1V6zm0 4h2v2H1v-2zm8-5h7v1H9zm0 11h2v-4h3v4h2V7H9z"
                    />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">Units</span>
                </Link>
              </li>
              <li>
                <Link
                  to="faqmanagement"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    viewBox="0 0 1024 1024"
                    fill="currentColor"
                    height="1em"
                    width="1em"
                  >
                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 708c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40zm62.9-219.5a48.3 48.3 0 00-30.9 44.8V620c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-21.5c0-23.1 6.7-45.9 19.9-64.9 12.9-18.6 30.9-32.8 52.1-40.9 34-13.1 56-41.6 56-72.7 0-44.1-43.1-80-96-80s-96 35.9-96 80v7.6c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V420c0-39.3 17.2-76 48.4-103.3C430.4 290.4 470 276 512 276s81.6 14.5 111.6 40.7C654.8 344 672 380.7 672 420c0 57.8-38.1 109.8-97.1 132.5z" />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Manage FAQs
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="textcontentmanagement"
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                >
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="1em"
                    width="1em"
                  >
                    <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-1 4v2h-5V7h5zm-5 4h5v2h-5v-2zM4 19V5h7v14H4z" />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Manage Home Content
                  </span>
                </Link>
              </li>

              <li>
                <button
                  type="button"
                  className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  aria-controls="dropdown-example"
                  data-collapse-toggle="dropdown-example"
                  onClick={toggleRiskDataVisualization}
                >
                  <IoPieChartSharp className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
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
                <ul
                  id="dropdown-example"
                  className={`py-2 space-y-2 ${
                    isRiskDataVisualizationOpen ? "block" : "hidden"
                  }`}
                >
                  <li>
                    <Link
                      to="submissionrate"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Submission Rate
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="identifiedrisks"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Identified Risks
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="identifiedriskshistorical"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Identified Risks per SDA
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="sdacomparisonchart"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Identified Risks per SDA Summary
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="riskcomparisonchart"
                      className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      Initial Risks vs Residual Risks
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </aside>
      )}

      <div
        id="drawer-navigation"
        className={`fixed pt-20 top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform bg-white w-64 dark:bg-gray-800 ${
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
          className="text-gray-400 bg-transparent  hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                to="submissions"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <IoDocumentsSharp className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Submissions
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="users"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="units"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path
                    fill="currentColor"
                    d="M0 16h8V0H0v16zM5 2h2v2H5V2zm0 4h2v2H5V6zm0 4h2v2H5v-2zM1 2h2v2H1V2zm0 4h2v2H1V6zm0 4h2v2H1v-2zm8-5h7v1H9zm0 11h2v-4h3v4h2V7H9z"
                  />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Units</span>
              </Link>
            </li>
            <li>
              <Link
                to="faqmanagement"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  viewBox="0 0 1024 1024"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 708c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40zm62.9-219.5a48.3 48.3 0 00-30.9 44.8V620c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-21.5c0-23.1 6.7-45.9 19.9-64.9 12.9-18.6 30.9-32.8 52.1-40.9 34-13.1 56-41.6 56-72.7 0-44.1-43.1-80-96-80s-96 35.9-96 80v7.6c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V420c0-39.3 17.2-76 48.4-103.3C430.4 290.4 470 276 512 276s81.6 14.5 111.6 40.7C654.8 344 672 380.7 672 420c0 57.8-38.1 109.8-97.1 132.5z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Manage FAQs
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="textcontentmanagement"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-1 4v2h-5V7h5zm-5 4h5v2h-5v-2zM4 19V5h7v14H4z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Manage Home Content
                </span>
              </Link>
            </li>

            <li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-example"
                data-collapse-toggle="dropdown-example"
                onClick={toggleRiskDataVisualization}
              >
                <IoPieChartSharp className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
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
              <ul
                id="dropdown-example"
                className={`py-2 space-y-2 ${
                  isRiskDataVisualizationOpen ? "block" : "hidden"
                }`}
              >
                <li>
                  <Link
                    to="submissionrate"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Submission Rate
                  </Link>
                </li>
                <li>
                  <Link
                    to="identifiedrisks"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Identified Risks
                  </Link>
                </li>
                <li>
                  <Link
                    to="identifiedriskshistorical"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Identified Risks per SDA
                  </Link>
                </li>
                <li>
                  <Link
                    to="sdacomparisonchart"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Identified Risks per SDA Summary
                  </Link>
                </li>
                <li>
                  <Link
                    to="riskcomparisonchart"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    Initial Risks vs Residual Risks
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default SideNavbar;
