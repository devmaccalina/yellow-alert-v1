import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import yellowalert from "../assets/yellowalert.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isPasswordValid = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPassword) {
      setError("Password is required.");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError(
        "Password must be at least 6 characters long, include at least one uppercase letter, and one special character."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Confirm password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      if (response.ok) {
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-gray-900 bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://ustalumniassociation.files.wordpress.com/2020/10/ust-2.jpg?w=1200')",
      }}
    >
      <div className="container mx-auto py-4 px-4 flex items-center justify-center min-h-screen">
        <section className="rounded-xl  px-10 py-12 max-w-xl w-full">
          <div className="flex flex-col items-center justify-center mx-auto">
            <a
              href="#"
              className="flex items-center mb-6 text-3xl font-semibold text-yellow-500 "
            >
              <img className="w-10 h-10 mr-2" src={yellowalert} alt="logo" />
              YellowAlert
            </a>
            <div className="w-full bg-white rounded-lg shadow">
              <div className="p-6 space-y-4 sm:p-8">
                <h1 className="text-l font-bold leading-tight tracking-tight md:text-2xl">
                  Reset your password
                </h1>
                {error && <p className="text-red-500">{error}</p>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewPassword(e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        placeholder="New Password"
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          style={{ color: "black" }}
                        />
                      </span>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setConfirmPassword(e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        placeholder="Confirm Password"
                        required
                      />
                      <span
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEye : faEyeSlash}
                          style={{ color: "black" }}
                        />
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  >
                    Reset Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;
