import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";
import {jwtDecode} from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ReCAPTCHA from "react-google-recaptcha";
import Modal from "./Modal";
import yellowalert from "../assets/yellowalert.png";

interface JwtPayload {
  roles: string[];
  isNewUser: boolean;
  [key: string]: any;
}

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [emailSentMessage, setEmailSentMessage] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (attempts >= 3) {
      setIsDisabled(true);
      setError("Too many attempts. Please try again after 1 minute.");
      const timer = setTimeout(() => {
        setIsDisabled(false);
        setAttempts(0);
        setError("");
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  // const handleCaptchaChange = (value: string | null) => {
  //   setCaptchaValue(value);
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.endsWith("@ust.edu.ph")) {
      setError("Please use your university email (@ust.edu.ph).");
      return;
    }

    // if (!captchaValue) {
    //   setError("Please complete the CAPTCHA.");
    //   return;
    // }

    try {
      const response = await fetch("http://localhost:8080/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password}),
        // body: JSON.stringify({ email, password, captchaValue }),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json(); // Read once
      console.log("Response data:", responseData);

      

      if (response.ok) {
        const token = responseData.token;
    const decodedToken = jwtDecode<JwtPayload>(token);
    login(token);

    const userRole = decodedToken.roles?.[0];
    const isNewUser = decodedToken.isNewUser;

    if (isNewUser) {
      navigate("/prerequisites");
    } else if (userRole === "ROLE_ADMIN") {
      navigate("/admin");
    } else if (userRole === "ROLE_APPROVER") {
      navigate("/approver/approverdetails");
    } else if (userRole === "ROLE_USER") {
      navigate("/");
    }
        // const data = await response.json();
        // const token = data.token;
        // const decodedToken = jwtDecode<JwtPayload>(token);
        // login(token);
        // const userRole = decodedToken.roles?.[0];
        // const isNewUser = decodedToken.isNewUser; // Check if the user is new
        // if (isNewUser) {
        //   navigate("/prerequisites");
        // } else if (userRole === "ROLE_ADMIN") {
        //   navigate("/admin");
        // } else if (userRole === "ROLE_APPROVER") {
        //   navigate("/approver/approverdetails"); // Updated URL
        // } else if (userRole === "ROLE_USER") {
        //   navigate("/");
        // }
      } else {
        if (responseData.message === "Account is disabled") {
          setError("Your account is disabled. Please contact support.");
        } else if (responseData.message === "Incorrect email") {
          setError("Email is incorrect. Please check your email.");
        } else if (responseData.message === "Incorrect password") {
          setError("Password is incorrect. Please check your password.");
        } else {
          setAttempts((prev) => prev + 1);
          setError("Login failed. Please check your credentials.");
        }

        // const errorData = await response.json();
        // if (errorData.message === "Account is disabled") {
        //   setError("Your account is disabled. Please contact support.");
        // } else if (errorData.message === "Incorrect email") {
        //   setError("Email is incorrect. Please check your email.");
        // } else if (errorData.message === "Incorrect password") {
        //   setError("Password is incorrect. Please check your password.");
        // } else {
        //   setAttempts((prev) => prev + 1);
        //   setError("Login failed. Please check your credentials.");
        // }
      }
    } catch (error) {
      setError("An error occurred during login.");
      console.error("Login error:", error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setShowForgotPassword(false); // Close the popup immediately

      try {
          const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: resetEmail }),
          });

          setError(""); // Clear any previous errors
          setEmailSentMessage("Password reset email sent successfully.");
      } catch (error) {
          console.error("Forgot password error:", error);
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
                  Sign in to your account
                </h1>
                {error && <p className="text-red-500">{error}</p>}
                {emailSentMessage && (
                  <p className="text-green-500">{emailSentMessage}</p>
                )}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                      placeholder="user@ust.edu.ph"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                        required
                        disabled={isDisabled}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="remember"
                          aria-describedby="remember"
                          type="checkbox"
                          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="remember" className="text-gray-500">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-primary-600 hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  {/* <div
                    className="recaptcha-container"
                    style={{
                      transform: "scale(0.85)",
                      transformOrigin: "0 0",
                      maxWidth: "100%",
                    }}
                  >
                    <ReCAPTCHA
                      sitekey="6LdqSOIpAAAAABh9QlokKcKE3OdJLFslH9M5alo2"
                      onChange={handleCaptchaChange}
                    />
                  </div> */}
                  <button
                    type="submit"
                    className="w-full text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    disabled={isDisabled}
                  >
                    Log in
                  </button>
                  <p className="text-sm font-light text-gray-500">
                    Don’t have an account yet?{" "}
                    <a
                      href="/register"
                      className="font-medium text-primary-600 hover:underline"
                    >
                      Sign up
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
      {showForgotPassword && (
        <Modal onClose={() => setShowForgotPassword(false)}>
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
            <form onSubmit={handleForgotPassword}>
              <div>
                <label
                  htmlFor="resetEmail"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="user@ust.edu.ph"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Login;
