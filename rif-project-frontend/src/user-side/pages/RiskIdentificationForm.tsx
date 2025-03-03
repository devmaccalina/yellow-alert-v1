import { useContext, useState, ChangeEvent, useEffect } from "react";
import { Label, Radio, Dropdown, Checkbox } from "flowbite-react";
import { MdKeyboardArrowDown, MdClose, MdEdit } from "react-icons/md";
import { FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { FaTrashCan } from "react-icons/fa6";
import AuthContext from "../../auth/AuthContext";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface Opportunity {
  description: string;
}

interface ActionPlan {
  description: string;
}

interface RiskParticular {
  description: string;
}

interface FormData {
  sdaNumber: number;
  uploadRIF: File | null;
  issueParticulars: string;
  issueType: string;
  riskParticulars: RiskParticular[];
  riskSEV: number;
  riskPROB: number;
  riskLevel: string;
  riskType: string;
  opportunities: Opportunity[];
  actionPlans: ActionPlan[];
  date: string;
  submissionDate?: string;
  responsiblePersonNames: string[];
  riskRating: number;
  status: string;
  userEmail?: string; // New field for user email
}

// Component
const RiskIdentificationForm: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Initial form state
  const initialState: FormData = {
    sdaNumber: 0,
    uploadRIF: null,
    issueParticulars: "",
    issueType: "",
    riskParticulars: [{ description: "" }],
    riskSEV: 0,
    riskPROB: 0,
    riskLevel: "",
    riskType: "",
    opportunities: [{ description: "" }],
    actionPlans: [{ description: "" }],
    date: "",
    responsiblePersonNames: [],
    riskRating: 0,
    status: "",
    userEmail: "", // Initialize with empty string
  };

  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [date, setDate] = useState(""); // Add state for managing date input
  const [riskRating, setRiskRating] = useState(0);
  const [rowsData, setRowsData] = useState<FormData[]>([]);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]); // State to hold the tags
  const { reportId } = useParams<{ reportId: string }>();

  useEffect(() => {
    if (reportId) {
      fetchReportData(parseInt(reportId));
    }
  }, [reportId]);

  useEffect(() => {
    updateRiskLevel(riskRating);
  }, [riskRating]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken: any = jwtDecode(token);
      setFormData((prevFormData) => ({
        ...prevFormData,
        userEmail: decodedToken.email || prevFormData.userEmail,
      }));
    }
  }, []);

  const fetchReportData = async (reportId: number) => {
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

      const data = await response.json();
      console.log("Fetched data:", data); // Debugging line
      if (
        data &&
        data.report &&
        data.report.riskFormData &&
        data.report.riskFormData.length > 0
      ) {
        populateFormData(data);
      } else {
        console.warn("No riskFormData found in the response");
        setFormData(initialState); // Reset form if no data is found
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setFormData(initialState); // Reset form if there's an error
    }
  };

  const populateFormData = (data: any) => {
    const riskFormData = data.report.riskFormData
      ? data.report.riskFormData
      : [];

    setRowsData(
      riskFormData.map((item: any) => ({
        ...item,
        responsiblePersonNames: item.responsiblePersons.map(
          (person: any) => person.name
        ),
      }))
    );

    if (riskFormData.length > 0) {
      setActiveRowIndex(0);
      const formDataToUpdate = riskFormData[0];
      if (formDataToUpdate.opportunities.length === 0) {
        formDataToUpdate.opportunities = [{ description: "" }];
      }
      setFormData(formDataToUpdate);
      setTags(
        riskFormData[0].responsiblePersons.map((person: any) => person.name)
      );
    } else {
      setTags([]);
    }
  };

  const getRiskLevel = (rating: number): string => {
    if (rating >= 1 && rating <= 7) {
      return "L";
    } else if (rating >= 8 && rating <= 14) {
      return "M";
    } else if (rating >= 15 && rating <= 25) {
      return "H";
    }
    return "";
  };

  const updateRiskLevel = (rating: number) => {
    const riskLevel = getRiskLevel(rating);
    setFormData((prevFormData) => ({
      ...prevFormData,
      riskLevel: riskLevel,
    }));
    if (activeRowIndex !== null) {
      setRowsData((prevRowsData) =>
        prevRowsData.map((row, index) =>
          index === activeRowIndex ? { ...row, riskLevel: riskLevel } : row
        )
      );
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      let dataToSubmit = rowsData.map((data, index) =>
        prepareData({
          ...data,
          responsiblePersonNames: data.responsiblePersonNames,
          userEmail: formData.userEmail,
        })
      );

      if (activeRowIndex !== null) {
        const preparedFormData = prepareData({
          ...formData,
          date: date,
          responsiblePersonNames: tags,
          userEmail: formData.userEmail,
        });
        dataToSubmit[activeRowIndex] = preparedFormData;
      } else {
        const preparedFormData = prepareData({
          ...formData,
          date: date,
          responsiblePersonNames: tags,
          userEmail: formData.userEmail,
        });
        dataToSubmit.push(preparedFormData);
      }

      if (reportId) {
        await updateData(reportId, dataToSubmit);
      } else {
        await submitData(dataToSubmit);
      }
      resetFormState();
    } else {
      setError("Please fill out the form correctly before submitting.");
    }
  };

  const updateData = async (reportId: string, data: FormData[]) => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:8080/api/riskforms/updateRiskFormData?reportId=${reportId}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update report");

      alert("Form updated successfully!");
      resetFormState();
    } catch (error) {
      console.error("Error updating report:", error);
      setError("Failed to update report. Please try again later.");
    }
  };

  const submitData = async (data: FormData[]) => {
    const token = localStorage.getItem("token");
    const url = reportId
      ? `http://localhost:8080/api/riskforms/updateRiskFormData?reportId=${reportId}`
      : "http://localhost:8080/api/riskforms/submit";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token in the headers
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      alert("Form submitted successfully!");
      resetFormState();
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Failed to submit report. Please try again later.");
    }
  };

  const handleChangeCheckbox = (value: string) => {
    let newIssueTypes = formData.issueType.includes(value)
      ? formData.issueType.split(",").filter((type) => type !== value)
      : [...formData.issueType.split(",").filter((type) => type), value];

    if (newIssueTypes.length > 2) {
      newIssueTypes = newIssueTypes.slice(-2); // Keep only the last two selected checkboxes
    }

    // Update the form state with either the new issue types array joined into a string or empty if no checkboxes are checked
    setFormData({
      ...formData,
      issueType: newIssueTypes.length > 0 ? newIssueTypes.join(",") : "",
    });

    if (activeRowIndex !== null) {
      // Update the row data if editing an existing row
      const updatedRowsData = rowsData.map((data, idx) => {
        if (idx === activeRowIndex) {
          return { ...data, issueType: newIssueTypes.join(",") };
        }
        return data;
      });
      setRowsData(updatedRowsData);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      issueType: newIssueTypes.length
        ? ""
        : "At least one issue type must be selected",
    }));

    if (error && validateForm()) {
      setError(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.currentTarget.value.trim() !== "") {
      event.preventDefault();
      const newTag = event.currentTarget.value.trim();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);

        if (activeRowIndex !== null) {
          const updatedRowsData = rowsData.map((row, idx) => {
            if (idx === activeRowIndex) {
              return { ...row, responsiblePersonNames: updatedTags };
            }
            return row;
          });
          setRowsData(updatedRowsData);
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            responsiblePersonNames: updatedTags,
          }));
        }
      }
      event.currentTarget.value = ""; // Clear input after adding tag
    }
  };

  const removeTag = (indexToRemove: number) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);

    if (activeRowIndex !== null) {
      const updatedRowsData = rowsData.map((row, idx) => {
        if (idx === activeRowIndex) {
          return { ...row, responsiblePersonNames: updatedTags };
        }
        return row;
      });
      setRowsData(updatedRowsData);
    }
  };

  const prepareData = (data: FormData): FormData => ({
    ...data,
    opportunities: data.opportunities.filter(
      (opportunity: Opportunity) => opportunity.description.trim() !== ""
    ),
    actionPlans: data.actionPlans.filter(
      (actionPlan: ActionPlan) => actionPlan.description.trim() !== ""
    ),
    riskParticulars: data.riskParticulars.filter(
      (riskParticular: RiskParticular) =>
        riskParticular.description.trim() !== ""
    ),
    responsiblePersonNames: data.responsiblePersonNames, // This is now directly passed

    submissionDate: new Date().toISOString().split("T")[0], // Add the current date as submissionDate
    userEmail: data.userEmail || formData.userEmail, // Ensure userEmail is included
  });

  const handleAddRiskParticular = () => {
    // Prevent adding a new opportunity if the last one is empty
    if (
      formData.riskParticulars[
        formData.riskParticulars.length - 1
      ]?.description.trim() !== ""
    ) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        riskParticulars: [...prevFormData.riskParticulars, { description: "" }],
      }));
    }
  };

  const handleRemoveRiskParticular = (index: number) => {
    const updatedRiskParticulars = formData.riskParticulars.filter(
      (_, i) => i !== index
    );
    const updatedFormData = {
      ...formData,
      riskParticulars: updatedRiskParticulars,
    };

    if (activeRowIndex !== null) {
      const updatedRowsData = rowsData.map((data, idx) =>
        idx === activeRowIndex ? updatedFormData : data
      );
      setRowsData(updatedRowsData);
    }
    setFormData(updatedFormData);
  };

  const handleRiskParticularChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (value.length <= 500) {
      const updatedRiskParticulars = formData.riskParticulars.map((item, i) => {
        if (i === index) {
          return { ...item, description: value };
        }
        return item;
      });
      setFormData({ ...formData, riskParticulars: updatedRiskParticulars });

      // Update rowsData with the changed riskParticulars
      if (activeRowIndex !== null) {
        const updatedRowsData = rowsData.map((data, idx) =>
          idx === activeRowIndex
            ? { ...data, riskParticulars: updatedRiskParticulars }
            : data
        );
        setRowsData(updatedRowsData);
      }
    }
  };

  const handleAddOpportunity = () => {
    // Prevent adding a new opportunity if the last one is empty
    if (
      formData.opportunities[
        formData.opportunities.length - 1
      ]?.description.trim() !== ""
    ) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        opportunities: [...prevFormData.opportunities, { description: "" }],
      }));
    }
  };

  const handleRemoveOpportunity = (index: number) => {
    const updatedOpportunities = formData.opportunities.filter(
      (_, i) => i !== index
    );
    const updatedFormData = {
      ...formData,
      opportunities: updatedOpportunities,
    };

    if (activeRowIndex !== null) {
      const updatedRowsData = rowsData.map((data, idx) =>
        idx === activeRowIndex ? updatedFormData : data
      );
      setRowsData(updatedRowsData);
    }
    setFormData(updatedFormData);
  };

  const handleAddActionPlan = () => {
    // Prevent adding a new action plan if the last one is empty
    if (
      formData.actionPlans[
        formData.actionPlans.length - 1
      ]?.description.trim() !== ""
    ) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        actionPlans: [...prevFormData.actionPlans, { description: "" }],
      }));
    }
  };

  const handleRemoveActionPlan = (index: number) => {
    const updatedActionPlans = formData.actionPlans.filter(
      (_, i) => i !== index
    );
    const updatedFormData = { ...formData, actionPlans: updatedActionPlans };

    if (activeRowIndex !== null) {
      const updatedRowsData = rowsData.map((data, idx) =>
        idx === activeRowIndex ? updatedFormData : data
      );
      setRowsData(updatedRowsData);
    }
    setFormData(updatedFormData);
  };

  const handleOpportunityChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (value.length <= 500) {
      const updatedOpportunities = formData.opportunities.map((item, i) => {
        if (i === index) {
          return { ...item, description: value };
        }
        return item;
      });
      setFormData({ ...formData, opportunities: updatedOpportunities });

      // Update rowsData with the changed opportunities
      if (activeRowIndex !== null) {
        const updatedRowsData = rowsData.map((data, idx) =>
          idx === activeRowIndex
            ? { ...data, opportunities: updatedOpportunities }
            : data
        );
        setRowsData(updatedRowsData);
      }
    }
  };

  const handleActionPlanChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (value.length <= 500) {
      const updatedActionPlans = formData.actionPlans.map((item, i) => {
        if (i === index) {
          return { ...item, description: value };
        }
        return item;
      });
      setFormData({ ...formData, actionPlans: updatedActionPlans });

      // Update rowsData with the changed action plans
      if (activeRowIndex !== null) {
        const updatedRowsData = rowsData.map((data, idx) =>
          idx === activeRowIndex
            ? { ...data, actionPlans: updatedActionPlans }
            : data
        );
        setRowsData(updatedRowsData);
      }
    }
  };

  const rowsDropdownItems =
    rowsData.length > 0 ? (
      rowsData.map((_, index) => (
        <Dropdown.Item key={index} onClick={() => selectRow(index)}>
          Row {index + 1}
        </Dropdown.Item>
      ))
    ) : (
      <Dropdown.Item key="no-rows" className="text-gray-500">
        No rows available
      </Dropdown.Item>
    );

  const rowsListItems =
    rowsData.length > 0 ? (
      rowsData.map((_, index) => (
        <li
          key={index}
          className={`group mt-5 flex justify-between cursor-pointer border-l-2 px-2 py-2 font-semibold transition ${
            activeRowIndex === index
              ? "border-l-yellow-500 text-yellow-500"
              : "border-transparent hover:border-l-yellow-500 hover:text-yellow-500"
          }`}
          onClick={() => selectRow(index)}
        >
          <span>Row {index + 1}</span>
          {activeRowIndex !== index && (
            <MdEdit
              className="opacity-0 group-hover:opacity-100 mr-2"
              // Adjust size as needed
              size="20px"
            />
          )}
        </li>
      ))
    ) : (
      <li className="text-gray-500">No rows available</li>
    );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumericField = [
      "riskSEV",
      "riskPROB",
      "sdaNumber",
      "riskRating",
    ].includes(name);
    let newValue: string | number = isNumericField ? Number(value) : value;

    if (activeRowIndex !== null) {
      const updatedRowsData = rowsData.map((rowData, index) => {
        if (index === activeRowIndex) {
          const updatedRow = { ...rowData, [name]: newValue };
          if (name === "riskSEV" || name === "riskPROB") {
            updatedRow.riskRating = updatedRow.riskSEV * updatedRow.riskPROB;
          }
          return updatedRow;
        }
        return rowData;
      });
      setRowsData(updatedRowsData);
      if (name === "riskSEV" || name === "riskPROB") {
        const updatedRow = updatedRowsData[activeRowIndex];
        setRiskRating(updatedRow.riskRating);
      }
    } else {
      const updatedFormData = { ...formData, [name]: newValue };
      if (name === "riskSEV" || name === "riskPROB") {
        updatedFormData.riskRating =
          updatedFormData.riskSEV * updatedFormData.riskPROB;
        setRiskRating(updatedFormData.riskRating);
      }
      setFormData(updatedFormData);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: newValue.toString().trim() ? "" : "This field is required",
    }));

    if (error && validateForm()) {
      setError(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      uploadRIF: file || null,
    }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDate(value);

    if (activeRowIndex !== null) {
      // Update date in the specific row in rowsData for edits
      const updatedRowsData = rowsData.map((rowData, index) => {
        if (index === activeRowIndex) {
          return { ...rowData, date: value };
        }
        return rowData;
      });
      setRowsData(updatedRowsData);
    } else {
      // Update formData for new entries
      setFormData((prevFormData) => ({
        ...prevFormData,
        date: value,
      }));
    }

    // Clear date error if date is now valid
    setErrors((prevErrors) => ({
      ...prevErrors,
      date: value.trim() ? "" : "This field is required",
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.sdaNumber) {
      newErrors.sdaNumber = "SDA Number is required";
    }
    if (!formData.issueParticulars.trim()) {
      newErrors.issueParticulars = "Issue particulars are required";
    }
    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }
    if (!formData.riskSEV) {
      newErrors.riskSEV = "Severity (SEV) is required";
    }
    if (!formData.riskPROB) {
      newErrors.riskPROB = "Probability (PROB) is required";
    }
    if (!formData.riskLevel.trim()) {
      newErrors.riskLevel = "Risk level is required";
    }
    if (!formData.riskType.trim()) {
      newErrors.riskType = "Risk type is required";
    }
    if (!formData.status.trim()) {
      newErrors.status = "Status is required";
    }
    if (!formData.issueType.trim()) {
      newErrors.issueType = "At least one issue type must be selected";
    }
    if (
      !formData.actionPlans.some(
        (actionPlan) => actionPlan.description.trim() !== ""
      )
    ) {
      newErrors.actionPlans = "At least one action plan is required";
    }
    if (
      !formData.riskParticulars.some(
        (riskParticular) => riskParticular.description.trim() !== ""
      )
    ) {
      newErrors.riskParticulars = "At least one risk particular is required";
    }
    if (!tags.length) {
      newErrors.responsiblePersonNames =
        "At least one responsible person is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validateForm()) {
      const newFormData = {
        ...formData,
        date: date,
        responsiblePersonNames: [...tags], // Ensure tags are included
      };

      if (activeRowIndex !== null) {
        const updatedRowsData = rowsData.map((data, index) =>
          index === activeRowIndex ? newFormData : data
        );
        setRowsData(updatedRowsData);
        setActiveRowIndex(null); // Reset the active row index after updating
      } else {
        setRowsData([...rowsData, newFormData]);
      }

      resetForm();
      setDate("");
      setError(null);
    } else {
      setError("Please fill out all fields before adding another row.");
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setActiveRowIndex(null);
    setTags([]); // Reset tags
    setError(null);
  };

  // Update the resetFormState function to ensure it properly resets everything
  const resetFormState = () => {
    setFormData(initialState);
    setRowsData([]);
    setActiveRowIndex(null);
    setDate("");
    setRiskRating(0);
    setError(null);
    setErrors({});
    setTags([]);
    if (reportId) {
      // Redirect to the appropriate page or clear the reportId to avoid refetching
      navigate("/submissions"); // Or any other appropriate page
    }
  };

  const selectRow = (index: number) => {
    const selectedRow = rowsData[index];
    if (selectedRow.opportunities.length === 0) {
      selectedRow.opportunities = [{ description: "" }];
    }
    setActiveRowIndex(index);
    setTags(selectedRow.responsiblePersonNames || []);

    setFormData({
      ...selectedRow,
      issueType: selectedRow.issueType,
      opportunities: selectedRow.opportunities.map((opportunity) => ({
        ...opportunity,
      })),
      actionPlans: selectedRow.actionPlans.map((actionPlan) => ({
        ...actionPlan,
      })),
      riskParticulars: selectedRow.riskParticulars.map((riskParticular) => ({
        ...riskParticular,
      })),
      responsiblePersonNames: selectedRow.responsiblePersonNames || [],
    });

    setError(null);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 min-h-screen my-24">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Risk Identification Form
        </h2>

        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="grid grid-cols-8 pt-3 sm:grid-cols-10">
        <div className="my-4 col-span-8 sm:hidden">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Existing Rows
          </label>
          <Dropdown
            label=""
            inline
            dismissOnClick={false}
            renderTrigger={() => (
              <button
                id="dropdownActionButton"
                data-dropdown-toggle="dropdownAction"
                className="inline-flex w-full py-2.5 items-center bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-3"
                type="button"
              >
                <div className="flex justify-between w-full">
                  <span>Choose one</span>
                  <MdKeyboardArrowDown className="h-5 w-5" />
                </div>
              </button>
            )}
          >
            {rowsDropdownItems}
          </Dropdown>
          <hr className="my-4" />
        </div>

        <div className="col-span-2 hidden sm:block">
          <ul>{rowsListItems}</ul>
        </div>

        <div className="col-span-8 overflow-hidden rounded-xl sm:bg-yellow-100 sm:px-8 sm:shadow">
          <div className="mt-4 mb-10">
            <div className="grid gap-4 mb-4 sm:grid-cols-1">
              <div className="lg:col-span-2">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Fields marked with <span className="text-red-500">*</span> are
                  required.
                </p>
                <form onSubmit={handleSubmitFinal} method="post">
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                    {/* <div className="md:col-span-3">
                        <label
                          htmlFor="file_input"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Upload RIF (Optional)
                        </label>
                        <input
                          type="file"
                          name="uploadRIF"
                          onChange={handleFileChange}
                          accept=".pdf"
                        />
                      </div> */}
                    <div className="md:col-span-5">
                      <label
                        htmlFor="sdaNumber"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        SDA Number <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="sdaNumber"
                        name="sdaNumber"
                        value={
                          activeRowIndex !== null
                            ? rowsData[activeRowIndex].sdaNumber
                            : formData.sdaNumber
                        }
                        onChange={handleChange}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                      >
                        <option value="">Select an option</option>
                        <option value="1">1 - Leadership and Governance</option>
                        <option value="2">2 - Thomasian Identity</option>
                        <option value="3">3 - Teaching and Learning</option>
                        <option value="4">4 - Research and Innovation</option>
                        <option value="5">5 - Resource Management</option>
                        <option value="6">6 - Public Presence</option>
                        <option value="7">
                          7 - Community Development and Advocacy
                        </option>
                        <option value="8">
                          8 - Student Welfare and Services
                        </option>
                        <option value="9">9 - Internationalization</option>
                      </select>
                      {errors.sdaNumber && (
                        <p className="text-red-500">{errors.sdaNumber}</p>
                      )}
                    </div>
                    <div className="md:col-span-5">
                      <hr className="mt-4 mb-8" />

                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-bold text-yellow-600"
                      >
                        ISSUE(S)
                      </label>
                    </div>

                    <div className="md:col-span-5">
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Particulars <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="issueParticulars"
                        rows={4}
                        value={
                          activeRowIndex !== null
                            ? rowsData[activeRowIndex].issueParticulars
                            : formData.issueParticulars
                        }
                        className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="Description"
                        onChange={handleChange}
                        maxLength={500}
                      ></textarea>
                      <div className="text-right text-xs text-gray-500">
                        {formData.issueParticulars.length} / 500
                      </div>
                      {errors.issueParticulars && (
                        <p className="text-red-500">
                          {errors.issueParticulars}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-5 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-900">
                          Issue Type <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <fieldset className="flex flex-row gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="issue-internal"
                            name="issueType"
                            checked={formData.issueType.includes("Internal")}
                            onChange={() => handleChangeCheckbox("Internal")}
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                          />
                          <Label htmlFor="issue-internal">Internal</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="issue-external"
                            name="issueType"
                            checked={formData.issueType.includes("External")}
                            onChange={() => handleChangeCheckbox("External")}
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                          />
                          <Label htmlFor="issue-external">External</Label>
                        </div>
                      </fieldset>
                      {errors.issueType && (
                        <p className="text-red-500">{errors.issueType}</p>
                      )}
                    </div>

                    <div className="md:col-span-5">
                      <hr className="mt-4 mb-8" />

                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-bold text-yellow-600"
                      >
                        RISK(S)
                      </label>
                    </div>

                    <div className="md:col-span-5 mb-2">
                      <div className="relative w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-900">
                              Particulars{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <p className="my-2 text-xs text-gray-500">
                              Use the "Add" button to include more entries.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddRiskParticular}
                            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-xs font-medium text-center text-white rounded inline-flex items-center"
                          >
                            <FiPlus className="mr-2" />
                            <span>Add</span>
                          </button>
                        </div>
                        {formData.riskParticulars.map((particular, index) => (
                          <div
                            key={index}
                            className="relative flex items-center mb-2"
                          >
                            <div className="mr-3">
                              {" "}
                              <FaCircle className="w-2 h-2 text-yellow-600" />
                            </div>
                            <textarea
                              name="riskParticulars"
                              rows={4}
                              value={particular.description}
                              onChange={(e) =>
                                handleRiskParticularChange(e, index)
                              }
                              className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Write here..."
                              maxLength={500}
                            />
                            <div className="text-right text-xs text-gray-500">
                              {particular.description.length} / 500
                            </div>
                            <button
                              onClick={() => handleRemoveRiskParticular(index)}
                              className={`ml-2 py-1 px-3 rounded ${
                                index === 0
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-red-500 hover:text-red-600"
                              }`}
                              disabled={index === 0}
                            >
                              <FaTrashCan />
                            </button>
                          </div>
                        ))}
                        {errors.riskParticulars && (
                          <p className="text-red-500">
                            {errors.riskParticulars}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="riskSEV"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Severity (SEV) <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="riskSEV"
                        name="riskSEV"
                        value={
                          activeRowIndex !== null
                            ? rowsData[activeRowIndex].riskSEV
                            : formData.riskSEV
                        }
                        onChange={handleChange}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                      >
                        <option value="">Select an option</option>
                        <option value="1">1 - Insignificant</option>
                        <option value="2">2 - Slight</option>
                        <option value="3">3 - Moderate</option>
                        <option value="4">4 - Severe</option>
                        <option value="5">5 - Very Severe</option>
                      </select>
                      {errors.riskSEV && (
                        <p className="text-red-500">{errors.riskSEV}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor="probability"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Probability (PROB){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="riskPROB"
                        name="riskPROB"
                        value={
                          activeRowIndex !== null
                            ? rowsData[activeRowIndex].riskPROB
                            : formData.riskPROB
                        }
                        onChange={handleChange}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                      >
                        <option value="">Select probability</option>
                        <option value="1">1 - Extremely Unlikely</option>
                        <option value="2">2 - Very Unlikely</option>
                        <option value="3">3 - Unlikely</option>
                        <option value="4">4 - Likely</option>
                        <option value="5">5 - Very Likely</option>
                      </select>
                      {errors.riskPROB && (
                        <p className="text-red-500">{errors.riskPROB}</p>
                      )}
                    </div>

                    <div className="md:col-span-1">
                      <label
                        htmlFor="number-input"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Risk Rating
                      </label>
                      <input
                        type="text"
                        name="riskRating"
                        id="disabled-input-2"
                        aria-label="disabled input 2"
                        className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5 cursor-not-allowed"
                        value={riskRating}
                        readOnly
                      />
                    </div>

                    <div className="md:col-span-5">
                      <label
                        htmlFor="message"
                        className="block my-2 text-sm font-medium text-gray-900"
                      >
                        Risk Categorization
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Level <span className="text-red-500">*</span>
                      </label>
                      <fieldset className="flex max-w-md flex-row gap-4">
                        <div className="flex items-center gap-2">
                          <Radio
                            id="risk-l"
                            name="riskLevel"
                            value="L"
                            checked={formData.riskLevel === "L"}
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                            readOnly
                            disabled
                          />
                          <Label htmlFor="risk-l">Low (1-7)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Radio
                            id="risk-m"
                            name="riskLevel"
                            value="M"
                            checked={formData.riskLevel === "M"}
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                            readOnly
                            disabled
                          />
                          <Label htmlFor="risk-m">Medium (8-14)</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Radio
                            id="risk-h"
                            name="riskLevel"
                            value="H"
                            checked={formData.riskLevel === "H"}
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                            readOnly
                            disabled
                          />
                          <Label htmlFor="risk-h">High (15-25)</Label>
                        </div>
                      </fieldset>
                      {errors.riskLevel && (
                        <p className="text-red-500">{errors.riskLevel}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Risk Type <span className="text-red-500">*</span>
                      </label>
                      <fieldset className="flex max-w-md flex-row gap-4">
                        <div className="flex items-center gap-2">
                          <Radio
                            id="risk-initial"
                            name="riskType"
                            value="Initial"
                            checked={
                              activeRowIndex !== null
                                ? rowsData[activeRowIndex].riskType ===
                                  "Initial"
                                : formData.riskType === "Initial"
                            }
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                            onChange={handleChange}
                          />

                          <Label htmlFor="risk-initial">Initial</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Radio
                            id="risk-residual"
                            name="riskType"
                            value="Residual"
                            checked={
                              activeRowIndex !== null
                                ? rowsData[activeRowIndex].riskType ===
                                  "Residual"
                                : formData.riskType === "Residual"
                            }
                            className="checked:bg-yellow-500 focus:ring-yellow-500"
                            onChange={handleChange}
                          />

                          <Label htmlFor="risk-residual">Residual</Label>
                        </div>
                      </fieldset>
                      {errors.riskType && (
                        <p className="text-red-500">{errors.riskType}</p>
                      )}
                    </div>
                    <div className="md:col-span-5 mt-4">
                      <div className="relative w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <label
                              htmlFor="number-input"
                              className="block text-sm font-medium mb-2 text-gray-900"
                            >
                              Opportunities
                            </label>
                            <p
                              id="floating_helper_text"
                              className="my-2 text-xs text-gray-500"
                            >
                              Use the "Add" button to include more entries.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddOpportunity}
                            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-xs font-medium text-center text-white rounded inline-flex items-center"
                          >
                            <FiPlus className="mr-2" />
                            <span>Add</span>
                          </button>
                        </div>
                        {formData.opportunities.map((opportunity, index) => (
                          <div
                            key={index}
                            className="relative flex items-center mb-2"
                          >
                            <div className="mr-3">
                              <FaCircle className="w-2 h-2 text-yellow-600" />
                            </div>{" "}
                            {/* Bullet point */}
                            <textarea
                              name="opportunities"
                              rows={4}
                              value={opportunity.description}
                              onChange={(e) =>
                                handleOpportunityChange(e, index)
                              }
                              className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Write here..."
                              maxLength={500}
                            />
                            <div className="text-right text-xs text-gray-500">
                              {opportunity.description.length} / 500
                            </div>
                            <button
                              onClick={() => handleRemoveOpportunity(index)}
                              className={`ml-2 py-1 px-3 rounded ${
                                index === 0
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-red-500 hover:text-red-600"
                              }`}
                              disabled={index === 0}
                            >
                              <FaTrashCan />
                            </button>
                          </div>
                        ))}

                        {errors.opportunities && (
                          <p className="text-red-500">{errors.opportunities}</p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-5">
                      <hr className="mt-4 mb-8" />

                      <label
                        htmlFor="message"
                        className="block mb-2 text-sm font-bold text-yellow-600"
                      >
                        ACTION(S) TAKEN
                      </label>
                    </div>

                    <div className="md:col-span-5">
                      <div className="relative w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <label
                              htmlFor="number-input"
                              className="block text-sm font-medium mb-2 text-gray-900"
                            >
                              Action Plan{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <p
                              id="floating_helper_text"
                              className="my-2 text-xs text-gray-500"
                            >
                              Use the "Add" button to include more entries.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddActionPlan}
                            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 text-xs font-medium text-center text-white rounded inline-flex items-center"
                          >
                            <FiPlus className="mr-2" />
                            <span>Add</span>
                          </button>
                        </div>
                        {formData.actionPlans.map((action, index) => (
                          <div
                            key={index}
                            className="relative flex items-center mb-2"
                          >
                            <div className="mr-3">
                              <FaCircle className="w-2 h-2 text-yellow-600" />
                            </div>
                            <textarea
                              name="actionPlan"
                              rows={4}
                              value={action.description}
                              onChange={(e) => handleActionPlanChange(e, index)}
                              className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                              placeholder="Write here..."
                              maxLength={500}
                            />
                            <div className="text-right text-xs text-gray-500">
                              {action.description.length} / 500
                            </div>
                            <button
                              onClick={() => handleRemoveActionPlan(index)}
                              className={`ml-2 py-1 px-3 rounded ${
                                index === 0
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-red-500 hover:text-red-600"
                              }`}
                              disabled={index === 0}
                            >
                              <FaTrashCan />
                            </button>
                          </div>
                        ))}
                        {errors.actionPlans && (
                          <p className="text-red-500">{errors.actionPlans}</p>
                        )}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="datepicker"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Target Completion Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative max-w-sm">
                        <input
                          id="datepicker"
                          name="date"
                          type="date"
                          value={
                            activeRowIndex !== null
                              ? rowsData[activeRowIndex].date
                              : date
                          }
                          onChange={handleDateChange}
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full ps-10 p-2.5"
                          placeholder="Select date"
                        />
                      </div>
                      {errors.date && (
                        <p className="text-red-500">{errors.date}</p>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <label
                        htmlFor="responsiblePersonNames"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Person(s) Responsible{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="responsiblePersonNames"
                        id="responsiblePersonNames"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                        placeholder="Type here and press enter..."
                        onKeyDown={handleKeyDown}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-yellow-200 px-2 py-1 rounded"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.responsiblePersonNames && (
                        <p className="text-red-500">
                          {errors.responsiblePersonNames}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-5">
                      <label
                        htmlFor="status"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Status <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="status"
                        name="status"
                        rows={3}
                        className="block w-full p-2.5 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                        value={
                          activeRowIndex !== null
                            ? rowsData[activeRowIndex].status
                            : formData.status
                        }
                        onChange={handleChange}
                        placeholder="Enter status description here..."
                        maxLength={500}
                      ></textarea>
                      <div className="text-right text-xs text-gray-500">
                        {formData.status.length} / 500
                      </div>
                      {errors.status && (
                        <p className="text-red-500">{errors.status}</p>
                      )}
                    </div>

                    <div className="md:col-span-5">
                      <hr className="mt-4 mb-8" />
                    </div>

                    <div className="md:col-span-5 flex justify-between">
                      <div className="inline-flex items-start">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-md text-yellow-500 hover:text-white border border-yellow-500 hover:bg-yellow-600"
                        >
                          Add Another Row
                        </button>
                      </div>
                      <div className="inline-flex items-end">
                        {reportId ? (
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white border border-transparent rounded-md bg-yellow-500 hover:bg-yellow-600"
                          >
                            Save and Submit
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white border border-transparent rounded-md bg-yellow-500 hover:bg-yellow-600"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                    {error && (
                      <div className="md:col-span-5 mt-2">
                        <div
                          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
                          role="alert"
                        >
                          <svg
                            className="flex-shrink-0 inline w-4 h-4 me-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                          </svg>
                          <span className="sr-only">Info</span>
                          <div>
                            <span className="font-medium">Error</span> {error}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskIdentificationForm;
