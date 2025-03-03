import React, { useState, useEffect, useContext, useRef } from "react";
import AuthContext from "../../auth/AuthContext";
import SignaturePad from "react-signature-pad-wrapper";

interface Tag {
  id: number;
  value: string;
}

interface ApproverData {
  professionalTitle: string;
  postNominalTitle: string;
  approverPhoto: string;
}

async function uploadApprover(
  professionalTitle: string,
  postNominalTitle: string,
  approverUnit: string,
  file?: Blob
) {
  const formData = new FormData();
  formData.append("professionalTitle", professionalTitle);
  formData.append("postNominalTitle", postNominalTitle);
  formData.append("approverUnit", approverUnit);
  if (file) {
    formData.append("file", file);
  }

  const response = await fetch("http://localhost:8080/api/approvers/upload", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return response.json();
}

async function fetchApprover() {
  const response = await fetch("http://localhost:8080/api/approvers", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (response.ok) {
    return response.json();
  } else {
    return null;
  }
}

async function fetchApproverImage() {
  const response = await fetch("http://localhost:8080/api/approvers/image", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (response.ok) {
    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  } else {
    return null;
  }
}

async function fetchUnits() {
  const response = await fetch(
    "http://localhost:8080/api/prerequisites/units",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (response.ok) {
    return response.json();
  } else {
    return [];
  }
}

const ApproverDetails: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState<Tag[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [postNominalTitle, setPostNominalTitle] = useState("");
  const [units, setUnits] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    const loadApprover = async () => {
      const data = await fetchApprover();
      if (data) {
        setProfessionalTitle(data.professionalTitle);
        setPostNominalTitle(data.postNominalTitle);
        setSelectedUnit(data.approverUnit); // Updated line
        setSearch(data.approverUnit); // Updated line
        if (data.postNominalTitle) {
          setTags(
            data.postNominalTitle
              .split(", ")
              .map((value: string, index: number) => ({
                id: index + 1,
                value,
              }))
          );
        }
      }

      const image = await fetchApproverImage();
      if (image) {
        setPreviewUrl(image);
      }
    };

    const loadUnits = async () => {
      const units = await fetchUnits();
      setUnits(units);
    };

    loadApprover();
    loadUnits();
  }, []);

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setPreviewUrl(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.currentTarget.value) {
      event.preventDefault();
      const newTagValue = event.currentTarget.value.trim();
      if (newTagValue && !tags.some((tag) => tag.value === newTagValue)) {
        const newTag: Tag = { id: tags.length + 1, value: newTagValue };
        setTags([...tags, newTag]);
        event.currentTarget.value = "";
      }
    }
  };

  const removeTag = (idToRemove: number) => {
    setTags(tags.filter((tag) => tag.id !== idToRemove));
  };

  const handleSubmit = async () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataUrl = signaturePadRef.current.toDataURL();
      const blob = await (await fetch(dataUrl)).blob();
      const response = await uploadApprover(
        professionalTitle,
        tags.map((tag) => tag.value).join(", "),
        selectedUnit,
        blob
      );
      console.log("Upload response:", response);
      alert("Saved successfully!");
    } else {
      // If the signature pad is empty, retain the previous signature if available
      if (previewUrl) {
        const response = await uploadApprover(
          professionalTitle,
          tags.map((tag) => tag.value).join(", "),
          selectedUnit
        );
        console.log("Upload response:", response);
        alert("Saved successfully without new signature!");
      } else {
        alert("Please draw your signature before saving.");
      }
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 min-h-screen my-24">
      <div className="flex flex-col items-right">
        <h2 className="font-bold text-5xl mt-5 tracking-tight">
          Approver Details
        </h2>
        <hr className="h-px my-8 border-yellow-500 border-2" />
      </div>
      <div className="col-span-8 overflow-hidden rounded-xl sm:bg-yellow-100 sm:px-8 sm:shadow-md">
        <div className="pt-4">
          <h1 className="py-2 text-2xl font-semibold">Set your details here</h1>
        </div>
        <hr className="mt-4 mb-8" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="professionalTitle"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Professional Title{" "}
              <span className="italic font-normal">(optional)</span>
            </label>
            <select
              id="professionalTitle"
              name="professionalTitle"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            >
              <option value="">Select a title</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Inst.">Inst.</option>
              <option value="Senior Teacher">Senior Teacher</option>
              <option value="Dr.">Dr.</option>
              <option value="Atty.">Atty.</option>
              <option value="Engr.">Engr.</option>
              <option value="Asst. Prof.">Asst. Prof.</option>
              <option value="Assoc. Prof.">Assoc. Prof.</option>
              <option value="Prof.">Prof.</option>
              <option value="Fr.">Fr.</option>
              <option value="Rev.">Rev.</option>
              <option value="Rev. Fr.">Rev. Fr.</option>
              <option value="Dean">Dean</option>
              <option value="Dir.">Dir.</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="postNominalTitle"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Post-Nominal Title{" "}
              <span className="italic font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="postNominalTitle"
              id="postNominalTitle"
              onChange={(e) => setPostNominalTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
              placeholder="e.g., PhD, MSc"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-yellow-200 px-2 py-1 rounded"
                >
                  {tag.value}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="text-sm text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 mb-8">
          <label
            htmlFor="approverUnit"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Unit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="approverUnit"
            id="approverUnit"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="Search and select a unit"
          />
          {dropdownOpen && (
            <div className="mt-2 bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {units
                .filter((unit) =>
                  unit.toLowerCase().includes(search.toLowerCase())
                )
                .map((unit, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-yellow-100 cursor-pointer"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setSearch(unit);
                      setDropdownOpen(false);
                    }}
                  >
                    {unit}
                  </div>
                ))}
            </div>
          )}
        </div>
        <hr className="mt-4 mb-8" />
        <div className="mb-10">
          <label
            htmlFor="draw-signature"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Draw your E-signature <span className="text-red-500">*</span>
          </label>
          <p
            id="helper-text-explanation"
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            By uploading your signature, you are providing explicit consent for
            us to store and use this data for the intended purpose. We are
            committed to protecting your personal data in compliance with the
            Data Privacy Act. Your signature will be stored securely and will
            not be shared with any third parties without your explicit consent.
          </p>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Stored Signature"
              className="w-auto max-h-32 object-cover rounded-lg mt-4"
              style={{ opacity: 0.85 }}
            />
          )}
          <SignaturePad
            ref={signaturePadRef}
            options={{ minWidth: 1, maxWidth: 3, penColor: "black" }}
            canvasProps={{
              width: "500px",
              height: "200px",
              className: "signatureCanvas bg-white border border-gray-300",
            }}
          />
          <div className="flex items-center justify-center w-full my-4">
            <button
              type="button"
              className="text-white bg-gray-500 hover:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 mr-2"
              onClick={handleClearSignature}
            >
              Clear Signature
            </button>
          </div>
          <button
            type="submit"
            className="text-white bg-yellow-500 hover:bg-yellow-600 font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={handleSubmit}
          >
            Save all
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproverDetails;
