import React, { useState, useEffect } from "react";
import { Dropdown } from "flowbite-react";
import { MdKeyboardArrowDown } from "react-icons/md";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: { id: number; name: string }[];
  active: boolean;
  unit: string;
}

interface Approver {
  id: number;
  professionalTitle: string;
  postNominalTitle: string;
  approverPhoto: string;
  approverUnit: string;
  user: User;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [approvers, setApprovers] = useState<{ [key: number]: Approver }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [showRoleConfirmation, setShowRoleConfirmation] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [statusAction, setStatusAction] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("Active");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchApprover = async (userId: number) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/approvers/byUserId/${userId}`,
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

        const approver = await response.json();
        setApprovers((prev) => ({ ...prev, [userId]: approver }));
      } catch (error) {
        console.error("Error fetching approver:", error);
      }
    };

    users.forEach((user) => {
      if (user.roles.some((role) => role.name === "ROLE_APPROVER")) {
        fetchApprover(user.id);
      }
    });
  }, [users, token]);

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`;
  };

  const getRoleDisplayName = (roles: { id: number; name: string }[]) => {
    const roleNames = roles.map((role) => {
      switch (role.name) {
        case "ROLE_USER":
          return "User";
        case "ROLE_APPROVER":
          return "Approver";
        case "ROLE_ADMIN":
          return "Administrator";
        default:
          return "User";
      }
    });
    return roleNames.join(", ");
  };

  const handleSaveUser = async (user: User, roleId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${user.id}/roles`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roleId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleRoleChange = (user: User, roleId: number) => {
    setSelectedUser(user);
    setSelectedRoleId(roleId);
    setShowRoleConfirmation(true);
  };

  const confirmRoleChange = () => {
    if (selectedUser && selectedRoleId !== null) {
      handleSaveUser(selectedUser, selectedRoleId);
      setShowRoleConfirmation(false);
      setSelectedUser(null);
      setSelectedRoleId(null);
    }
  };

  const cancelRoleChange = () => {
    setShowRoleConfirmation(false);
    setSelectedUser(null);
    setSelectedRoleId(null);
  };

  const handleStatusChange = (user: User, isActive: boolean) => {
    setSelectedUser(user);
    setStatusAction(isActive ? "activate" : "deactivate");
    setShowStatusConfirmation(true);
  };

  const confirmStatusChange = async () => {
    if (selectedUser && statusAction !== null) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${selectedUser.id}/status`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ active: statusAction === "activate" }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        setShowStatusConfirmation(false);
        setSelectedUser(null);
        setStatusAction(null);
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  };

  const cancelStatusChange = () => {
    setShowStatusConfirmation(false);
    setSelectedUser(null);
    setStatusAction(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (role: string | null) => {
    setRoleFilter(role);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const roleMatch =
      !roleFilter ||
      user.roles.some((role) => {
        switch (roleFilter) {
          case "User":
            return role.name === "ROLE_USER";
          case "Approver":
            return role.name === "ROLE_APPROVER";
          case "Administrator":
            return role.name === "ROLE_ADMIN";
          default:
            return true;
        }
      });
    const statusMatch =
      statusFilter === "All" ||
      (statusFilter === "Active" && user.active) ||
      (statusFilter === "Inactive" && !user.active);
    return (
      fullName.includes(searchQuery.toLowerCase()) && roleMatch && statusMatch
    );
  });

  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-screen-xl px-4 min-h-screen">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">Users</h2>
        <div className="flex justify-between items-center">
          <p className="text-neutral-500 text-xl mt-3">For user management</p>
        </div>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="relative overflow-x-auto">
        <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
          <div>
            <Dropdown
              label={roleFilter ? roleFilter : "Filter"}
              inline
              dismissOnClick={true}
              renderTrigger={() => (
                <button
                  id="dropdownActionButton"
                  data-dropdown-toggle="dropdownAction"
                  className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                  type="button"
                >
                  {roleFilter ? roleFilter : "Filter"}
                  <MdKeyboardArrowDown className="ml-2 h-5 w-5" />
                </button>
              )}
            >
              <Dropdown.Item onClick={() => handleRoleFilterChange(null)}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleFilterChange("User")}>
                User
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleFilterChange("Approver")}>
                Approver
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleRoleFilterChange("Administrator")}
              >
                Administrator
              </Dropdown.Item>
            </Dropdown>

            <button
              type="button"
              className={`px-4 ml-2 py-2 text-sm font-medium ${
                statusFilter === "Active"
                  ? "text-yellow-500 bg-yellow-100"
                  : "text-gray-500 bg-white"
              } border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => handleStatusFilterChange("Active")}
            >
              Active
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                statusFilter === "Inactive"
                  ? "text-yellow-500 bg-yellow-100"
                  : "text-gray-500 bg-white"
              } border-t border-b border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => handleStatusFilterChange("Inactive")}
            >
              Inactive
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                statusFilter === "All"
                  ? "text-yellow-500 bg-yellow-100"
                  : "text-gray-500 bg-white"
              } border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-primary-500 dark:focus:text-white`}
              onClick={() => handleStatusFilterChange("All")}
            >
              All
            </button>
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
              id="table-search-users"
              className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for users"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-yellow-100">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Unit
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="bg-white border-b hover:bg-gray-100"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                        <span className="text-xl font-semibold text-gray-600">
                          {getInitials(user.firstname, user.lastname)}
                        </span>
                      </div>
                      <div className="ps-3">
                        <div className="text-base font-semibold">{`${user.firstname} ${user.lastname}`}</div>
                        <div className="font-normal text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getRoleDisplayName(user.roles)}
                  </td>
                  <td className="px-6 py-4">
                    {user.unit || approvers[user.id]?.approverUnit || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStatusChange(user, !user.active)}
                        className={`inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 ${
                          user.active ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                      <Dropdown
                        label={
                          user.roles[0].name === "ROLE_USER"
                            ? "User"
                            : user.roles[0].name === "ROLE_APPROVER"
                            ? "Approver"
                            : "Administrator"
                        }
                        inline
                        dismissOnClick={false}
                        renderTrigger={() => (
                          <button
                            id={`dropdown-${user.id}`}
                            className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5"
                            type="button"
                          >
                            {user.roles[0].name === "ROLE_USER"
                              ? "User"
                              : user.roles[0].name === "ROLE_APPROVER"
                              ? "Approver"
                              : "Administrator"}
                            <MdKeyboardArrowDown className="ml-2 h-5 w-5" />
                          </button>
                        )}
                      >
                        <Dropdown.Item
                          onClick={() => handleRoleChange(user, 1)}
                        >
                          User
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleRoleChange(user, 2)}
                        >
                          Approver
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleRoleChange(user, 4)}
                        >
                          Administrator
                        </Dropdown.Item>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="inline-flex items-center -space-x-px">
              {Array.from({
                length: Math.ceil(filteredUsers.length / itemsPerPage),
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

      {showRoleConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Role Change</h2>
            <p className="mb-4">
              Are you sure you want to change this user's role?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={cancelRoleChange}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={confirmRoleChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              Confirm{" "}
              {statusAction === "activate" ? "Activation" : "Deactivation"}
            </h2>
            <p className="mb-4">
              Are you sure you want to{" "}
              {statusAction === "activate" ? "activate" : "deactivate"} this
              user?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={cancelStatusChange}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={confirmStatusChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
