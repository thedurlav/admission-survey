import React, { useState } from "react";
import { API } from "../context/AuthContext";
import toast from "react-hot-toast";

const CLASSES = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const MEDIUMS = ["Hindi", "English"];

const initial = {
  childName: "",
  fatherName: "",
  class: "",
  medium: "",
  previousSchool: "",
  location: "",
  mobileNo: "",
  remarks: "",
  surveyDate: new Date().toISOString().split("T")[0],
};

// Field MUST be outside StudentForm — if defined inside, it gets recreated
// on every keystroke causing inputs to lose focus
function Field({ name, label, required, error, children }) {
  return (
    <div className="form-group">
      <label>
        {label}
        {required && " *"}
      </label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default function StudentForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.childName.trim()) e.childName = "Child name is required";
    if (!form.fatherName.trim()) e.fatherName = "Father name is required";
    if (!form.class) e.class = "Class is required";
    if (!form.medium) e.medium = "Medium is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.mobileNo.trim()) e.mobileNo = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobileNo))
      e.mobileNo = "Must be exactly 10 digits";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }
    setLoading(true);
    try {
      await API.post("/students", form);
      toast.success("Student survey saved!");
      setForm(initial);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field
          name="childName"
          label="Child's Full Name"
          required
          error={errors.childName}
        >
          <input
            name="childName"
            value={form.childName}
            onChange={handleChange}
            placeholder="e.g. Arjun Patel"
            className={errors.childName ? "input-error" : ""}
          />
        </Field>

        <Field
          name="fatherName"
          label="Father's Name"
          required
          error={errors.fatherName}
        >
          <input
            name="fatherName"
            value={form.fatherName}
            onChange={handleChange}
            placeholder="e.g. Ramesh Patel"
            className={errors.fatherName ? "input-error" : ""}
          />
        </Field>

        <Field
          name="class"
          label="Applying for Class"
          required
          error={errors.class}
        >
          <select
            name="class"
            value={form.class}
            onChange={handleChange}
            className={errors.class ? "input-error" : ""}
          >
            <option value="">Select class</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {["Nursery", "LKG", "UKG"].includes(c) ? c : `Class ${c}`}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="medium"
          label="Preferred Medium"
          required
          error={errors.medium}
        >
          <select
            name="medium"
            value={form.medium}
            onChange={handleChange}
            className={errors.medium ? "input-error" : ""}
          >
            <option value="">Select medium</option>
            {MEDIUMS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field
          name="mobileNo"
          label="Mobile Number"
          required
          error={errors.mobileNo}
        >
          <input
            name="mobileNo"
            value={form.mobileNo}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            maxLength={10}
            inputMode="numeric"
            className={errors.mobileNo ? "input-error" : ""}
          />
        </Field>

        <Field
          name="surveyDate"
          label="Survey Date"
          required
          error={errors.surveyDate}
        >
          <input
            type="date"
            name="surveyDate"
            value={form.surveyDate}
            onChange={handleChange}
          />
        </Field>

        <Field
          name="location"
          label="Location / Area"
          required
          error={errors.location}
        >
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g. Rajendra Nagar, Indore"
            className={errors.location ? "input-error" : ""}
          />
        </Field>

        <Field
          name="previousSchool"
          label="Previous School (Optional)"
          error={errors.previousSchool}
        >
          <input
            name="previousSchool"
            value={form.previousSchool}
            onChange={handleChange}
            placeholder="Current/previous school name"
          />
        </Field>

        <div className="form-group full">
          <label>Remarks</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Any additional notes..."
            rows={3}
          />
        </div>
      </div>

      <div
        className="modal-footer"
        style={{
          padding: "1.25rem 0 0",
          borderTop: "1px solid var(--gray-100)",
          marginTop: "1.25rem",
        }}
      >
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "✓ Save Survey"}
        </button>
      </div>
    </form>
  );
}
