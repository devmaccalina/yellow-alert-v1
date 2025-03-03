import React, { useEffect, useState, useContext } from "react";
import "../../styles/form.css";
import image1 from "../../assets/image1.png";
import image4 from "../../assets/image4.png";
import AuthContext from "../../auth/AuthContext";
import { FaPrint } from "react-icons/fa";

interface Opportunity {
  description: string;
}

interface ActionPlan {
  description: string;
}

interface RiskParticular {
  description: string;
}

interface ResponsiblePerson {
  id: number;
  name: string;
}

interface RiskFormData {
  sdaNumber?: number;
  issueParticulars?: string;
  issueType?: string;
  riskParticulars?: RiskParticular[];
  riskSEV?: number;
  riskPROB?: number;
  riskLevel?: string;
  riskType?: string;
  opportunities: Opportunity[];
  actionPlans: ActionPlan[];
  date?: string;
  riskRating?: number;
  responsiblePersons: ResponsiblePerson[];
  status?: string;
  submissionDate?: string;
}

interface Prerequisite {
  id: number;
  unit: string;
  internalStakeholders: Stakeholder[];
  externalStakeholders: Stakeholder[];
}

interface Stakeholder {
  name: string;
}

interface PrintButtonAdminProps {
  reportId: string;
}

const PrintButtonAdmin: React.FC<PrintButtonAdminProps> = ({ reportId }) => {
  const [riskForms, setRiskForms] = useState<RiskFormData[]>([]);
  const [prerequisite, setPrerequisite] = useState<Prerequisite | null>(null);
  const [signatureImage, setSignatureImage] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [postNominalTitle, setPostNominalTitle] = useState("");
  const [approverPhoto, setApproverPhoto] = useState("");
  const [userFirstname, setUserFirstname] = useState("");
  const [userLastname, setUserLastname] = useState("");
  const [esignatureProfessionalTitle, setEsignatureProfessionalTitle] =
    useState("");
  const [esignaturePostNominalTitle, setEsignaturePostNominalTitle] =
    useState("");
  const [esignaturePhoto, setEsignaturePhoto] = useState("");
  const [approverApproveDate, setApproverApproveDate] = useState<string | null>(
    null
  );
  const [reportStatus, setReportStatus] = useState<string>("");
  const [approverFirstname, setApproverFirstname] = useState("");
  const [approverLastname, setApproverLastname] = useState("");

  useEffect(() => {
    console.log("PrintButtonAdmin mounted with reportId:", reportId);

    const fetchReportDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/riskforms/reportDetails/${reportId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setRiskForms(data.report.riskFormData);
        setPrerequisite(data.prerequisite);
        setUserFirstname(data.userFirstname);
        setUserLastname(data.userLastname);
        setEsignatureProfessionalTitle(data.esignatureProfessionalTitle);
        setEsignaturePostNominalTitle(data.esignaturePostNominalTitle);
        setReportStatus(data.report.status);
        if (data.esignaturePhoto) {
          const byteArray = new Uint8Array(
            atob(data.esignaturePhoto)
              .split("")
              .map((char) => char.charCodeAt(0))
          );
          const blob = new Blob([byteArray], { type: "image/png" });
          setEsignaturePhoto(URL.createObjectURL(blob));
        }
        if (data.report.approverApproveDate) {
          setApproverApproveDate(data.report.approverApproveDate);
        } else {
          setApproverApproveDate(null);
        }
        console.log("Fetched report details:", data);
      } catch (error) {
        console.error("Failed to fetch report details:", error);
      }
    };
    const fetchApprover = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:8080/api/riskforms/approverDetails/${reportId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProfessionalTitle(data.professionalTitle);
        setPostNominalTitle(data.postNominalTitle);
        setApproverFirstname(data.userFirstname);
        setApproverLastname(data.userLastname);
        if (data.approverPhoto) {
          const byteArray = new Uint8Array(
            atob(data.approverPhoto)
              .split("")
              .map((char) => char.charCodeAt(0))
          );
          const blob = new Blob([byteArray], { type: "image/png" });
          setApproverPhoto(URL.createObjectURL(blob));
        }
        console.log("Fetched approver details:", data);
      } catch (error) {
        console.error("Error fetching approver details:", error);
      }
    };

    fetchReportDetails();
    fetchApprover();
  }, [reportId]);

  const paragraphStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
  };

  const printForm = () => {
    const element = document.getElementById(`print-content-${reportId}`);
    if (element) {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";

      document.body.appendChild(iframe);

      const cssLink = document.querySelector('link[href*="form.css"]');
      let cssText = "";
      if (cssLink) {
        cssText = `<link href="../../styles/form.css" rel="stylesheet" type="text/css" media="print">`;
      } else {
        const styles = document.querySelectorAll("style");
        styles.forEach((style) => {
          cssText += style.outerHTML;
        });
      }

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
          <head>
              <title>Risk Identification Form</title>
              ${cssText}
              <style>
                  @page {
                      size: A4 landscape;
                      margin: 0.25in;
                  }
                  @media print {
                      body {
                          -webkit-print-color-adjust: exact;
                          margin: 0.25in;
                      }
                      .doc-content {
                          margin: 0.25in;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="doc-content">${element.innerHTML}</div>
          </body>
          </html>
        `);
        doc.close();

        iframe.onload = function () {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
          }
        };
      }
    }
  };

  return (
    <>
      <button type="button" onClick={printForm}>
        <FaPrint
          className="mr-2 text-gray-500 hover:text-gray-800"
          style={{ fontSize: "18px", marginTop: "-5px" }}
        />
      </button>

      <div
        id={`print-content-${reportId}`}
        className="c20 doc-content"
        style={{ display: "none" }}
      >
        <div>
          <div className="flex justify-between">
            <div style={{ display: "flex", alignItems: "center" }}>
              <p className="image">
                <span
                  style={{
                    overflow: "hidden",
                    display: "flex",
                    margin: "0 auto",
                    border: "0px solid #000000",
                    transform: "rotate(0rad) translateZ(0px)",
                    WebkitTransform: "rotate(0rad) translateZ(0px)",
                    width: "75.48px",
                    height: "86.4px",
                  }}
                >
                  <img
                    alt=""
                    src={image1}
                    style={{
                      width: "75.48px",
                      height: "86.4px",
                      marginLeft: "0px",
                      marginTop: "0px",
                      transform: "rotate(0rad) translateZ(0px)",
                      WebkitTransform: "rotate(0rad) translateZ(0px)",
                    }}
                    title=""
                  />
                </span>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="office title mt-5 pl-5">
                <span className="c40">
                  &nbsp;Office of Planning and Quality Management
                </span>
              </p>
              <p className="UST">
                <span className="c108">University of Santo Tomas</span>
              </p>
              <p className="Contact Information">
                <span className="c115">
                  Contact No. 3406-1611 loc. 8506 or 8413; email:
                  iso-opqm@ust.edu.ph
                </span>
              </p>
            </div>
          </div>

          <hr style={{ border: "2px solid black" }}></hr>
          <p className="c89">
            <span className="c45">RISK IDENTIFICATION FORM</span>
          </p>
          <p className="c112">
            <span className="c45">ISO 9001: 2015 Documentation</span>
          </p>
          <a id="t.8c3c2da983f659d888d169e3788314b8d34e609f"></a>
          <a id="t.6"></a>
          <table className="c37">
            {prerequisite && (
              <tr className="c110">
                <td className="c80" colSpan={1} rowSpan={1}>
                  <p className="c1">
                    <span className="c45"></span>
                  </p>
                  <p className="c6">
                    <span className="c9 c61" style={{ whiteSpace: "nowrap" }}>
                      Administrative/Academic Unit:
                    </span>
                  </p>
                </td>
                <td className="c135" colSpan={1} rowSpan={1}>
                  <p className="c1">
                    <span className="c9 c61" style={{ whiteSpace: "nowrap" }}>
                      {prerequisite.unit}
                    </span>
                  </p>
                </td>
                <td className="c2" colSpan={1} rowSpan={1}>
                  <p className="c89 c109">
                    <span className="c9 c61"></span>
                  </p>
                </td>
                <td className="c78" colSpan={1} rowSpan={1}>
                  <p className="c1 c87">
                    <span className="c9 c61"></span>
                  </p>
                </td>
                <td className="c140" colSpan={1} rowSpan={1}>
                  <p className="c6 c87">
                    <span className="c9 c61">Page</span>
                  </p>
                </td>
                <td className="c84" colSpan={1} rowSpan={1}>
                  <p className="c1">
                    <span className="c9 c61"></span>
                  </p>
                </td>
                <td className="c119" colSpan={1} rowSpan={1}>
                  <p className="c6 c136">
                    <span className="c9 c61">of</span>
                  </p>
                </td>
                <td className="c77" colSpan={1} rowSpan={1}>
                  <p className="c1">
                    <span className="c9 c61"></span>
                  </p>
                </td>
              </tr>
            )}
          </table>
        </div>
        <p className="c6">
          <span className="c94">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;
          </span>
        </p>
        <a id="t.b77d91ebb78f3c40f45893187130cc43d9e03e8e"></a>
        <a id="t.0"></a>
        <table className="c97">
          <tr className="c81">
            <td className="c90" colSpan={2}>
              <p className="c33">Internal Client/Stakeholder*</p>
            </td>
            <td className="c54" colSpan={2}>
              <p className="c33">External Client/Stakeholder*</p>
            </td>
          </tr>
          {prerequisite && (
            <React.Fragment>
              <tr className="c34">
                <td className="c131" colSpan={1}>
                  <p className="c6">
                    {prerequisite.internalStakeholders
                      .slice(0, 4)
                      .map((stakeholder, index) => (
                        <React.Fragment key={index}>
                          <span>
                            {index + 1}. {stakeholder.name}
                          </span>
                          <br />
                        </React.Fragment>
                      ))}
                  </p>
                </td>
                <td className="c79" colSpan={1}>
                  <p className="c6">
                    {prerequisite.internalStakeholders
                      .slice(4, 8)
                      .map((stakeholder, index) => (
                        <React.Fragment key={index}>
                          <span>
                            {index + 5}. {stakeholder.name}
                          </span>
                          <br />
                        </React.Fragment>
                      ))}
                  </p>
                </td>
                <td className="c72" colSpan={1}>
                  <p className="c6">
                    {prerequisite.externalStakeholders
                      .slice(0, 4)
                      .map((stakeholder, index) => (
                        <React.Fragment key={index}>
                          <span>
                            {index + 1}. {stakeholder.name}
                          </span>
                          <br />
                        </React.Fragment>
                      ))}
                  </p>
                </td>
                <td className="c79" colSpan={1}>
                  <p className="c6">
                    {prerequisite.externalStakeholders
                      .slice(4, 8)
                      .map((stakeholder, index) => (
                        <React.Fragment key={index}>
                          <span>
                            {index + 5}. {stakeholder.name}
                          </span>
                          <br />
                        </React.Fragment>
                      ))}
                  </p>
                </td>
              </tr>
            </React.Fragment>
          )}
        </table>
        <p className="c1">
          <span className="c60 c98"></span>
        </p>
        <a id="t.7550fea3bf133b3f9eac5b3a0517632f65f86eb2"></a>
        <a id="t.1"></a>
        <table className="c37">
          <thead>
            <tr className="c118">
              <td className="c120" colSpan={1} rowSpan={3}>
                <p className="c33">
                  <span className="c10">Item No.</span>
                </p>
              </td>
              <td className="c39" colSpan={1} rowSpan={3}>
                <p className="c33">
                  <span className="c10">SDA No.</span>
                </p>
              </td>
              <td className="c138" colSpan={3} rowSpan={1}>
                <p className="c33">
                  <span className="c16">ISSUE(S)</span>
                </p>
              </td>
              <td className="c147" colSpan={6} rowSpan={1}>
                <p className="c33 c43">
                  <span className="c113">RISK(S)</span>
                </p>
              </td>
              <td className="c29" colSpan={1} rowSpan={3}>
                <p className="c33 c43">
                  <span className="c10">Opportunities</span>
                </p>
              </td>
              <td className="c17" colSpan={6} rowSpan={1}>
                <p className="c33">
                  <span className="c16">ACTION (S) TAKEN</span>
                </p>
              </td>
            </tr>
            <tr className="c118">
              <td className="c91" colSpan={1} rowSpan={2}>
                <p className="c33">
                  <span className="c10">Particulars</span>
                </p>
              </td>
              <td className="c104" colSpan={2} rowSpan={1}>
                <p className="c33">
                  <span className="c10">(Pls. check)</span>
                </p>
              </td>
              <td className="c122" colSpan={1} rowSpan={2}>
                <p className="c33">
                  <span className="c31">Particulars</span>
                </p>
              </td>
              <td className="c8" colSpan={1} rowSpan={2}>
                <p className="c6 c139">
                  <span className="c10">SEV</span>
                </p>
              </td>
              <td className="c69" colSpan={1} rowSpan={2}>
                <p className="c33 c43">
                  <span className="c10">PROB</span>
                </p>
              </td>
              <td className="c116" colSpan={1} rowSpan={2}>
                <p className="c33 c43">
                  <span className="c10">Risk Rating</span>
                </p>
                <p className="c33 c43">
                  <span className="c60 c82">(Sev x Prob)</span>
                </p>
              </td>
              <td className="c146" colSpan={2} rowSpan={1}>
                <p className="c33 c27">
                  <span className="c31">Risk Categorization</span>
                </p>
              </td>
              <td className="c68" colSpan={1} rowSpan={2}>
                <p className="c33">
                  <span className="c10">Action Plans</span>
                </p>
                <p className="c33">
                  <span className="c60 c82">(Particulars)</span>
                </p>
                <p className="c33">
                  <span className="c60 c82">&nbsp;</span>
                </p>
              </td>
              <td className="c4" colSpan={1} rowSpan={2}>
                <p className="c33">
                  <span className="c10">Target Completion Date</span>
                </p>
              </td>
              <td className="c4" colSpan={1} rowSpan={2}>
                <p className="c15">
                  <span className="c10">Person </span>
                </p>
                <p className="c15">
                  <span className="c31">Responsible</span>
                </p>
              </td>
              <td className="c101" colSpan={2} rowSpan={1}>
                <p className="c33">
                  <span className="c10">Monitoring</span>
                </p>
              </td>
            </tr>
            <tr className="c118">
              <td className="c8" colSpan={1} rowSpan={1}>
                <p className="c33 c143">
                  <span className="c46">IN</span>
                </p>
              </td>
              <td className="c58" colSpan={1} rowSpan={1}>
                <p className="c33 c134">
                  <span className="c46">EX</span>
                </p>
              </td>
              <td className="c83" colSpan={1} rowSpan={1}>
                <p className="c6 c27">
                  <span className="c31">&nbsp;</span>
                  <span className="c60 c82">&nbsp; Level</span>
                </p>
                <p className="c33">
                  <span className="c82">(L, M, H)</span>
                </p>
              </td>
              <td className="c25" colSpan={1} rowSpan={1}>
                <p className="c33">
                  <span className="c60 c82">Initial/ Residual</span>
                </p>
              </td>
              <td className="c38" colSpan={1} rowSpan={1}>
                <p className="c33">
                  <span className="c31">Status</span>
                </p>
              </td>
              <td className="c39" colSpan={1} rowSpan={1}>
                <p className="c33">
                  <span className="c31">Date</span>
                </p>
                <tbody></tbody>
              </td>
            </tr>
            {riskForms.map((form, index) => (
              <tr className="c137" key={form.sdaNumber || index}>
                <td className="c23" colSpan={1} rowSpan={1}>
                  <p className="item_no">
                    <span className="c5">{index + 1}</span>{" "}
                  </p>
                </td>
                <td className="c11" colSpan={1} rowSpan={1}>
                  <p className="sda_number">
                    <span className="c5">{form.sdaNumber}</span>
                  </p>
                </td>
                <td className="c44" colSpan={1} rowSpan={1}>
                  <p className="issue_particulars">
                    <span className="c5">{form.issueParticulars}</span>
                  </p>
                </td>
                <td className="c13" colSpan={1} rowSpan={1}>
                  <p className="issue_typeInternal">
                    <span className="c5">
                      {form.issueType?.includes("Internal") ? "✓" : ""}
                    </span>
                  </p>
                </td>
                <td className="c53" colSpan={1} rowSpan={1}>
                  <p className="issue_typeExternal">
                    <span className="c5">
                      {form.issueType?.includes("External") ? "✓" : ""}
                    </span>
                  </p>
                </td>
                <td className="c35" colSpan={1} rowSpan={1}>
                  <p className="risk_particulars">
                    {form.riskParticulars?.map((particular, index) => (
                      <span className="c5" key={index}>
                        {particular.description}
                        <br />
                      </span>
                    ))}
                  </p>
                </td>
                <td className="c13" colSpan={1} rowSpan={1}>
                  <p className="risksev">
                    <span className="c5">{form.riskSEV}</span>
                  </p>
                </td>
                <td className="c59" colSpan={1} rowSpan={1}>
                  <p className="riskprob">
                    <span className="c5">{form.riskPROB}</span>
                  </p>
                </td>
                <td className="c70" colSpan={1} rowSpan={1}>
                  <p className="risk_rating">
                    <span className="c5">{form.riskRating}</span>
                  </p>
                </td>
                <td className="c83" colSpan={1} rowSpan={1}>
                  <p className="risk_level">
                    <span className="c5">{form.riskLevel}</span>
                  </p>
                </td>
                <td className="c25" colSpan={1} rowSpan={1}>
                  <p className="risk_type">
                    <span className="c5">{form.riskType}</span>
                  </p>
                </td>
                <td className="c32" colSpan={1} rowSpan={1}>
                  <p className="opportunities">
                    {form.opportunities.map((opportunity, idx) => (
                      <span className="c5" key={idx}>
                        {opportunity.description}
                        <br />
                      </span>
                    ))}
                  </p>
                </td>
                <td className="c67" colSpan={1} rowSpan={1}>
                  <p className="action_plan">
                    {form.actionPlans.map((action, idx) => (
                      <span className="c5" key={idx}>
                        {action.description}
                        <br />
                      </span>
                    ))}
                  </p>
                </td>
                <td className="c24" colSpan={1} rowSpan={1}>
                  <p className="date">
                    <span className="c5">
                      {form.date
                        ? new Date(form.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No Date Provided"}
                    </span>
                  </p>
                </td>
                <td className="c24" colSpan={1} rowSpan={1}>
                  <p className="responsible_person">
                    {form.responsiblePersons.map((person, idx) => (
                      <span className="c5" key={idx}>
                        {person.name}
                        {idx < form.responsiblePersons.length - 1 ? ", " : ""}
                        <br />
                      </span>
                    ))}
                  </p>
                </td>
                <td className="c55" colSpan={1} rowSpan={1}>
                  <p className="status">
                    <span className="c5">{form.status}</span>
                  </p>
                </td>
                <td className="c11" colSpan={1} rowSpan={1}>
                  <p className="submission_date">
                    <span className="c5">
                      {form.submissionDate
                        ? `As of ${new Date(
                            form.submissionDate
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : "No Date Provided"}
                    </span>
                  </p>
                </td>
              </tr>
            ))}
          </thead>
        </table>
        <p className="c6">
          <span>*Adjust number/columns, as applicable</span>
          <span className="c60 c117">&nbsp;</span>
        </p>
        <p className="c6" id="h.gjdgxs">
          <span className="c5">
            Note: IN = Internal issue; EX = External issue; SEV = Severity; PROB
            = Probability; L = Low; M = Medium; H = High
          </span>
        </p>
        <p className="c1">
          <span className="c36"></span>
        </p>
        <div style={{ whiteSpace: "nowrap" }}>
          <p className="c6 c121" style={paragraphStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="c92" style={{ marginBottom: "-20px" }}>
                  Prepared by:
                </span>
                <img
                  src={esignaturePhoto}
                  alt="Signature"
                  style={{
                    height: "80px",
                    marginLeft: "10px",
                    marginBottom: "-30px",
                  }}
                />
              </div>

              {reportStatus === "APPROVER_APPROVED" ||
              reportStatus === "ADMIN_VERIFIED" ? (
                <>
                  <span
                    className="c92"
                    style={{ marginLeft: "130px", marginBottom: "-15px" }}
                  >
                    Reviewed/Approved by:
                  </span>

                  <div>
                    <img
                      src={approverPhoto}
                      alt="Signature"
                      style={{
                        height: "80px",
                        marginRight: "60px",
                        marginLeft: "60px",
                        marginBottom: "-30px",
                      }}
                    />
                  </div>
                </>
              ) : (
                <span className="c92" style={{ marginBottom: "-60px" }}>
                  Reviewed/Approved by:
                  _________________________________________
                </span>
              )}
            </div>
          </p>
          <p className="c6" style={{ display: "inline" }}>
            <span className="c14">
              <div style={{ marginLeft: "88px" }}>
                <span className="font-bold border-b border-black">
                  {esignatureProfessionalTitle} {userFirstname} {userLastname}
                  {esignaturePostNominalTitle ? ", " : ""}
                  {esignaturePostNominalTitle}
                  <span className="font-normal">
                    {" "}
                    /{" "}
                    {riskForms.length > 0
                      ? riskForms[0].submissionDate
                      : "No Date Provided"}
                  </span>
                </span>
              </div>
              {reportStatus === "APPROVER_APPROVED" ||
              reportStatus === "ADMIN_VERIFIED" ? (
                <div style={{ marginTop: "-25px", marginLeft: "630px" }}>
                  <span className="font-bold border-b border-black">
                    {professionalTitle} {approverFirstname} {approverLastname}
                    {postNominalTitle ? ", " : ""}
                    {postNominalTitle}
                    <span className="font-normal">
                      {" "}
                      /{" "}
                      {approverApproveDate
                        ? new Date(approverApproveDate)
                            .toISOString()
                            .split("T")[0]
                        : "No Date Provided"}
                    </span>
                  </span>
                </div>
              ) : null}
              &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;
              &nbsp; &nbsp;Signature over Printed Name/Date &nbsp; &nbsp; &nbsp;
              &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp;
              &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
              &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
              &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Signature over Printed Name/Date
            </span>
          </p>
        </div>

        <tr className="page-break"></tr>
        <div style={{ pageBreakBefore: "always" }}>
          <p className="c21">
            <span className="c14"></span>
          </p>
          <div className="flex">
            <div className="app-container">
              <div className="column">
                {/* <p className="c21">
                  <span className="c14"></span>
                </p>
                <a id="t.e093c7e7721baa52a33c27063dc75e026cd26f4c"></a>
                <a id="t.2"></a> */}

                <table className="c37">
                  <tr className="c34">
                    <td className="c47 c73" colSpan={2} rowSpan={1}>
                      <p className="c6">
                        <span className="c16">
                          Strategic Directional Areas (SDA)
                        </span>
                      </p>
                      <p className="c1">
                        <span className="c42"></span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">1</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Leadership and Governance </span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">2</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Thomasian Identity</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c62">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">3</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Teaching and Learning</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">4</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Research and Innovation</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">5</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Resource Management </span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">6</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Public Presence </span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">7</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">
                          Community Development and Advocacy{" "}
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">8</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">
                          Student Welfare and Services
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c0" colSpan={1} rowSpan={1}>
                      <p className="c33">
                        <span className="c42">9</span>
                      </p>
                    </td>
                    <td className="c48" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c42">Internationalization</span>
                      </p>
                    </td>
                  </tr>
                </table>
                <a id="t.4d0c7a815873420abb7a9658d64689f7c095540e"></a>
                <a id="t.4"></a>
                <table className="c37">
                  <tr className="c34">
                    <td className="c47 c105" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c16">Severity (Sev)**</span>
                      </p>
                    </td>
                    <td className="c74 c47" colSpan={1} rowSpan={1}>
                      <p className="c6">
                        <span className="c16">Probability (Prob)**</span>
                      </p>
                      <p className="c1">
                        <span className="c42"></span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c105" colSpan={1} rowSpan={1}>
                      <p className="c6 c28">
                        <span className="c42">5 &nbsp; Very Severe</span>
                      </p>
                    </td>
                    <td className="c74" colSpan={1} rowSpan={1}>
                      <p className="c6 c114">
                        <span className="c42">5 &nbsp; Very Likely</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c105" colSpan={1} rowSpan={1}>
                      <p className="c6 c28">
                        <span className="c42">4 &nbsp; Severe</span>
                      </p>
                    </td>
                    <td className="c74" colSpan={1} rowSpan={1}>
                      <p className="c6 c114">
                        <span className="c42">4 &nbsp; Likely</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c105" colSpan={1} rowSpan={1}>
                      <p className="c6 c28">
                        <span className="c42">3 &nbsp; Moderate</span>
                      </p>
                    </td>
                    <td className="c74" colSpan={1} rowSpan={1}>
                      <p className="c6 c114">
                        <span className="c42">3 &nbsp; Unlikely</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c105" colSpan={1} rowSpan={1}>
                      <p className="c6 c28">
                        <span className="c42">2 &nbsp; Slight</span>
                      </p>
                    </td>
                    <td className="c74" colSpan={1} rowSpan={1}>
                      <p className="c6 c114">
                        <span className="c42">2 &nbsp; Very Unlikely</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c34">
                    <td className="c105" colSpan={1} rowSpan={1}>
                      <p className="c6 c28">
                        <span className="c42">1 &nbsp; Insignificant</span>
                      </p>
                    </td>
                    <td className="c74" colSpan={1} rowSpan={1}>
                      <p className="c6 c114">
                        <span className="c42">1 &nbsp; Extreme Unlikely</span>
                      </p>
                    </td>
                  </tr>
                </table>
                <p className="c6">
                  <span className="c5">
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                    __________________________________________________________
                  </span>
                </p>
                <p className="c6">
                  <span className="c5">
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; **Refer to Severity and
                    Probability Scales
                  </span>
                </p>
                <a id="t.01a40e0137041aa3600e13a73354ad6e6f848251"></a>
                <a id="t.5"></a>
                <table className="c37">
                  <tr className="c34">
                    <td className="c47 c128" colSpan={3} rowSpan={1}>
                      <p className="c6">
                        <span className="c16">
                          Risk Categorization (Priority Options)-Source: Adapted
                          from BSI, 2004
                        </span>
                      </p>
                      <p className="c1">
                        <span className="c16"></span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c66">
                    <td className="c12" colSpan={1} rowSpan={1}>
                      <p className="c33 c41">
                        <span className="c42">25-15</span>
                      </p>
                    </td>
                    <td className="c64" colSpan={1} rowSpan={1}>
                      <p className="c3">
                        <span className="c42">High </span>
                      </p>
                      <p className="c1 c18">
                        <span className="c42"></span>
                      </p>
                    </td>
                    <td className="c52" colSpan={1} rowSpan={1}>
                      <p className="c6 c18">
                        <span className="c42">
                          Unacceptable; risks that should be urgently reduced to
                          become tolerable or
                        </span>
                      </p>
                      <p className="c6 c18">
                        <span className="c42">acceptable</span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c66">
                    <td className="c12" colSpan={1} rowSpan={1}>
                      <p className="c33 c144">
                        <span className="c42">14-8</span>
                      </p>
                    </td>
                    <td className="c64" colSpan={1} rowSpan={1}>
                      <p className="c3">
                        <span className="c42">Medium </span>
                      </p>
                    </td>
                    <td className="c52" colSpan={1} rowSpan={1}>
                      <p className="c6 c18">
                        <span className="c42">
                          Risks that should be reduced to become tolerable or
                          acceptable
                        </span>
                      </p>
                    </td>
                  </tr>
                  <tr className="c132">
                    <td className="c12" colSpan={1} rowSpan={1}>
                      <p className="c33 c144">
                        <span className="c42">7-1</span>
                      </p>
                    </td>
                    <td className="c64" colSpan={1} rowSpan={1}>
                      <p className="c3">
                        <span className="c42">Low </span>
                      </p>
                    </td>
                    <td className="c52" colSpan={1} rowSpan={1}>
                      <p className="c6 c18">
                        <span className="c42">
                          Acceptable; risks that require minimal or no action
                        </span>
                      </p>
                    </td>
                  </tr>
                </table>
                <p className="c86">
                  <span className="c5"></span>
                </p>
                <p className="c86">
                  <span className="c5"></span>
                </p>
                <p className="c86">
                  <span className="c5"></span>
                </p>
                <p className="c1">
                  <span className="c60 c96"></span>
                </p>
              </div>
            </div>
            <div className="column">
              <a id="t.7bece1298abb30b95fd3fdb8197d8426f5217a65"></a>
              <a id="t.3"></a>
              <table className="c37">
                <tr style={{ height: "30px" }}>
                  <td>&nbsp;</td>
                </tr>

                <tr className="c34">
                  <td className="c19 c47" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9 c61">Definition of Terms</span>
                    </p>
                    <p className="c1">
                      <span className="c14"></span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Issue </span>
                      <span className="c14">
                        - Internal or external; positive or negative factors or
                        conditions for consideration by the unit
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Risk </span>
                      <span className="c26">
                        - Uncertainty which can lead to positive or negative
                        result
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Particulars &ndash; </span>
                      <span className="c26">Description or details</span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Severity </span>
                      <span className="c26">-</span>
                      <span className="c133">&nbsp;</span>
                      <span className="c14">
                        Degree or extent of damage or harm{" "}
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Probability - </span>
                      <span className="c26">
                        Likelihood that damage or harm will occur
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Risk Rating</span>
                      <span className="c14">
                        &nbsp;- Severity (Sev) x Probability (Prob)
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Initial Risk Level</span>
                      <span className="c14">
                        &nbsp;- Level of risk before action is taken to reduce
                        it
                      </span>
                    </p>
                    <p className="c6">
                      <span className="c9">Residual Risk Level </span>
                      <span className="c26">
                        &ndash; Level of risk after action to reduce it has been
                        taken
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Opportunity </span>
                      <span className="c14">
                        - Favorable condition that can arise as a result of
                        action plan to address risk
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Action Plan</span>
                      <span className="c14">
                        &nbsp;- What to do to address/handle the risk
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Person Responsible</span>
                      <span className="c14">
                        -- Who implements or ensures implementation of action
                        plan
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Status</span>
                      <span className="c14">
                        &nbsp;- Whether the action plan is yet to start/pending,
                        ongoing, near completion, or fully completed
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c63">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9">Date </span>
                      <span className="c26">-</span>
                      <span className="c9">&nbsp;</span>
                      <span className="c26">
                        Month/day/year of the status of the action plan, as
                        monitored
                      </span>
                    </p>
                  </td>
                </tr>
                <tr className="c34">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c1">
                      <span className="c14"></span>
                    </p>
                  </td>
                </tr>
                <tr className="c34">
                  <td className="c19 c47" colSpan={1} rowSpan={1}>
                    <p className="c6">
                      <span className="c9 c61">Notes: </span>
                    </p>
                    <p className="c1">
                      <span className="c14"></span>
                    </p>
                  </td>
                </tr>
                <tr className="c127">
                  <td className="c19" colSpan={1} rowSpan={1}>
                    <p className="c6 c65">
                      <span className="c14">
                        The Risk Identification Form (RIF) covers the following
                        under the ISO 9001:2015 Standard:
                      </span>
                    </p>
                    <p className="c6 c65">
                      <span className="c14">
                        Clause 4: Context of the Organization
                      </span>
                    </p>
                    <ul className="c75 lst-kix_list_5-0 start">
                      <li className="c65 c76 .doc-list-bullet-0">
                        <span className="c14">
                          Sub-clause 4.1 Understanding the Organization and its
                          context
                        </span>
                      </li>
                      <li className="c95 c65 .doc-list-bullet-0">
                        <span className="c14">
                          Sub-clause 4.4 Quality Management system and its
                          processes
                        </span>
                      </li>
                    </ul>
                    <p className="c6 c65">
                      <span className="c14">Clause 6: Planning</span>
                    </p>
                    <ul className="c75 lst-kix_list_6-0 start">
                      <li className="c95 c65 .doc-list-bullet-0">
                        <span className="c14">
                          Sub-clause 6.1 Actions to address risks and
                          opportunities
                        </span>
                      </li>
                    </ul>
                    <p className="c6 c65">
                      <span className="c14">
                        Clause 9: Performance evaluation
                      </span>
                    </p>
                    <ul className="c75 lst-kix_list_6-0">
                      <li className="c65 c95 .doc-list-bullet-0">
                        <span className="c14">
                          Sub-clause 9.3 Management review
                        </span>
                      </li>
                    </ul>
                    <p className="c6 c65">
                      <span className="c14">Clause 10: Improvement</span>
                    </p>
                    <ul className="c75 lst-kix_list_6-0">
                      <li className="c95 c65 .doc-list-bullet-0">
                        <span className="c14">
                          Sub-clause 10.2 Nonconformity and corrective action
                        </span>
                      </li>
                    </ul>
                    <p className="c1 c65">
                      <span className="c14"></span>
                    </p>
                    <p className="c6 c65">
                      <span className="c14">&nbsp;</span>
                    </p>
                    <p className="c1 c65">
                      <span className="c14"></span>
                    </p>
                  </td>
                </tr>
              </table>
              <p className="c1">
                <span className="c60 c96"></span>
              </p>
              <p className="c1">
                <span className="c60 c96"></span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer">
          <p className="c6 c57" style={{ margin: "0", padding: "0" }}>
            <span className="c26 c111">UST: S029-00-FO54 rev05 01/10/24</span>
          </p>
          <p className="c6 c102" style={{ margin: "0", padding: "0" }}>
            <span
              style={{
                overflow: "hidden",
                display: "inline-block",
                margin: "0px",
                border: "0px solid #000000",
                transform: "rotate(0rad) translateZ(0px)",
                WebkitTransform: "rotate(0rad) translateZ(0px)",
                width: "47.73px",
                height: "45.07px",
              }}
            >
              <img
                alt=""
                src={image4}
                style={{
                  width: "47.73px",
                  height: "45.07px",
                  marginLeft: "5px",
                  marginTop: "0px",
                  transform: "rotate(0rad) translateZ(0px)",
                  WebkitTransform: "rotate(0rad) translateZ(0px)",
                }}
                title=""
              />
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default PrintButtonAdmin;
