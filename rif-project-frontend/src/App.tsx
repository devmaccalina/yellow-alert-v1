import { FC, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthContext, { AuthProvider } from "./auth/AuthContext";
import Home from "./user-side/pages/Home";
import Faqs from "./user-side/pages/Faqs";
import Navbar from "./user-side/components/Navbar";
import Footer from "./user-side/components/Footer";
import Users from "./admin/pages/Users";
import SubmissionHistory from "./user-side/pages/SubmissionHistory";
import SideNavbar from "./admin/components/SideNavbar";
import Prerequisites from "./user-side/pages/Prerequisites";
import Esignature from "./user-side/pages/Esignature";
import RiskIdentificationForm from "./user-side/pages/RiskIdentificationForm";
import NotFoundPage from "./user-side/pages/NotFoundPage";
import Register from "./auth/Register";
import Login from "./auth/Login";
import ResetPassword from "./auth/ResetPassword";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicRoute from "./auth/PublicRoute";
import SubmissionRateTable from "./admin/pages/SubmissionRateTable";
import IdentifiedRisks from "./admin/pages/IdentifiedRisks";
import IdentifiedRisksHistorical from "./admin/pages/IdentifiedRisksHistorical";
import SDAComparisonChart from "./admin/pages/SDAComparisonChart";
import RiskComparisonChart from "./admin/pages/RiskComparisonChart";
import ApproverDetails from "./user-side/pages/ApproverDetails";
import SubmissionHistoryApprover from "./user-side/pages/SubmissionHistoryApprover";
import SubmissionHistoryAdmin from "./admin/pages/SubmissionHistoryAdmin";
import MainUnits from "./admin/pages/Units";
import FaqManagement from "./admin/pages/FaqManagement";
import TextContentManagement from "./admin/pages/TextContentManagement";
import IdentifiedRisksHistoricalUser from "./user-side/pages/IdentifiedRisksHistoricalUser";
import IdentifiedRisksHistoricalApprover from "./user-side/pages/IdentifiedRisksHistoricalApprover";
import SDAComparisonChartUser from "./user-side/pages/SDAComparisonChartUser";
import SDAComparisonChartApprover from "./user-side/pages/SDAComparisonChartApprover";

const App: FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/approver/*" element={<ApproverLayout />} />
          <Route path="/*" element={<UserLayout />} />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

const AdminLayout: FC = () => {
  return (
    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
      <SideNavbar />
      <div className="p-4 sm:ml-64">
        <div className="p-2 border-2 border-gray-200 border-dashed rounded-lg mt-14">
          <Routes>
            <Route path="/" element={<SubmissionHistoryAdmin />} />
            <Route path="submissions" element={<SubmissionHistoryAdmin />} />
            <Route path="users" element={<Users />} />
            <Route path="units" element={<MainUnits />} />

            <Route path="submissionrate" element={<SubmissionRateTable />} />
            <Route path="identifiedrisks" element={<IdentifiedRisks />} />
            <Route path="faqmanagement" element={<FaqManagement />} />
            <Route
              path="textcontentmanagement"
              element={<TextContentManagement />}
            />

            <Route
              path="identifiedriskshistorical"
              element={<IdentifiedRisksHistorical />}
            />
            <Route path="sdacomparisonchart" element={<SDAComparisonChart />} />
            <Route
              path="riskcomparisonchart"
              element={<RiskComparisonChart />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const ApproverLayout: FC = () => {
  const { isApproverDetailsComplete } = useContext(AuthContext);

  return (
    <ProtectedRoute allowedRoles={["ROLE_APPROVER"]}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="approverdetails" element={<ApproverDetails />} />
        <Route
          path="submissionhistoryapprover"
          element={
            isApproverDetailsComplete ? (
              <SubmissionHistoryApprover />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="identifiedriskshistoricalapprover"
          element={<IdentifiedRisksHistoricalApprover />}
        />
        <Route
          path="sdacomparisonchartapprover"
          element={<SDAComparisonChartApprover />}
        />

        <Route path="faqs" element={<Faqs />} />
        {/* <Route path="contact" element={<Contact />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </ProtectedRoute>
  );
};

const UserLayout: FC = () => {
  const {
    role,
    isAuthenticated,
    isPrerequisiteComplete,
    isEsignatureComplete,
  } = useContext(AuthContext);

  if (role === "ROLE_ADMIN") {
    return <Navigate to="/admin" />;
  }

  if (role === "ROLE_APPROVER") {
    return <Navigate to="/approver" />;
  }

  return (
    <ProtectedRoute allowedRoles={["ROLE_USER"]}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faqs" element={<Faqs />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="/prerequisites" element={<Prerequisites />} />
        <Route path="/esignature" element={<Esignature />} />
        <Route
          path="/identifiedriskshistoricaluser"
          element={<IdentifiedRisksHistoricalUser />}
        />
        <Route
          path="/sdacomparisonchartuser"
          element={<SDAComparisonChartUser />}
        />

        <Route
          path="/form"
          element={
            isPrerequisiteComplete && isEsignatureComplete ? (
              <RiskIdentificationForm />
            ) : (
              <NotFoundPage />
            )
          }
        />
        <Route
          path="/form/:reportId"
          element={
            isPrerequisiteComplete && isEsignatureComplete ? (
              <RiskIdentificationForm />
            ) : (
              <NotFoundPage />
            )
          }
        />
        <Route
          path="/submissions"
          element={
            isPrerequisiteComplete && isEsignatureComplete ? (
              <SubmissionHistory />
            ) : (
              <NotFoundPage />
            )
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </ProtectedRoute>
  );
};

export default App;
