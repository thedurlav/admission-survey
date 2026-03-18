import React, { useState, useEffect, useCallback } from "react";
import Topbar from "../components/Topbar";
import StudentForm from "../components/StudentForm";
import StudentTable from "../components/StudentTable";
import { API } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSurveyors, setLoadingSurveyors] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSurveyor, setShowAddSurveyor] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [newSurveyor, setNewSurveyor] = useState({
    username: "",
    password: "",
    fullName: "",
  });
  const [surveyorErrors, setSurveyorErrors] = useState({});
  const [savingSurveyor, setSavingSurveyor] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (e) {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const loadSurveyors = useCallback(async () => {
    setLoadingSurveyors(true);
    try {
      const res = await API.get("/users/surveyors");
      setSurveyors(res.data);
    } catch (e) {
      toast.error("Failed to load surveyors");
    } finally {
      setLoadingSurveyors(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "students") loadStudents();
    if (tab === "surveyors") loadSurveyors();
  }, [tab, loadStudents, loadSurveyors]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await API.get("/students/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `student_surveys_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel file downloaded!");
    } catch (e) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this survey entry?")) return;
    try {
      await API.delete(`/students/${id}`);
      setStudents((s) => s.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleToggleSurveyor = async (id) => {
    try {
      const res = await API.patch(`/users/surveyors/${id}/toggle`);
      setSurveyors((s) => s.map((x) => (x._id === id ? res.data : x)));
      toast.success("Status updated");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteSurveyor = async (id) => {
    if (!window.confirm("Delete this surveyor account?")) return;
    try {
      await API.delete(`/users/surveyors/${id}`);
      setSurveyors((s) => s.filter((x) => x._id !== id));
      toast.success("Surveyor deleted");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const validateSurveyor = () => {
    const e = {};
    if (!newSurveyor.fullName.trim()) e.fullName = "Full name required";
    if (!newSurveyor.username.trim()) e.username = "Username required";
    else if (!/^[a-z0-9_]+$/.test(newSurveyor.username))
      e.username = "Only lowercase letters, numbers, underscores";
    if (!newSurveyor.password) e.password = "Password required";
    else if (newSurveyor.password.length < 6)
      e.password = "At least 6 characters";
    return e;
  };

  const handleAddSurveyor = async (e) => {
    e.preventDefault();
    const errs = validateSurveyor();
    if (Object.keys(errs).length) {
      setSurveyorErrors(errs);
      return;
    }
    setSavingSurveyor(true);
    try {
      const res = await API.post("/users/surveyors", newSurveyor);
      setSurveyors((s) => [res.data, ...s]);
      setNewSurveyor({ username: "", password: "", fullName: "" });
      setShowAddSurveyor(false);
      toast.success("Surveyor created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create surveyor");
    } finally {
      setSavingSurveyor(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      search === "" ||
      s.childName.toLowerCase().includes(search.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.mobileNo.includes(search) ||
      (s.surveyedBy?.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const todayCount = students.filter((s) => {
    const d = new Date(s.surveyDate);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const uniqueLocations = new Set(students.map((s) => s.location)).size;

  return (
    <div className="page">
      <Topbar />

      <div className="dash-header">
        <div className="dash-greeting">Admin Dashboard</div>
        <div className="dash-sub">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${tab === "students" ? "active" : ""}`}
          onClick={() => setTab("students")}
        >
          📊 All Student Data
        </button>
        <button
          className={`nav-tab ${tab === "surveyors" ? "active" : ""}`}
          onClick={() => setTab("surveyors")}
        >
          👥 Surveyors
        </button>
        <button
          className={`nav-tab ${tab === "add" ? "active" : ""}`}
          onClick={() => setTab("add")}
        >
          ＋ Add Student
        </button>
      </div>

      <div className="content">
        {/* ── STUDENTS TAB ── */}
        {tab === "students" && (
          <div className="fade-in">
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Surveys</div>
                <div className="stat-number">{students.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Today</div>
                <div className="stat-number">{todayCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Surveyors</div>
                <div className="stat-number">{surveyors.length || "—"}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Locations</div>
                <div className="stat-number">{uniqueLocations}</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">All Student Surveys</div>
                <div className="search-bar">
                  <div className="search-input-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                      className="search-input"
                      placeholder="Search name, location, surveyor..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: "100%", minWidth: 160 }}
                    />
                  </div>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleExport}
                    disabled={exporting || students.length === 0}
                  >
                    {exporting ? "⏳ Exporting..." : "⬇ Export Excel"}
                  </button>
                </div>
              </div>

              {loadingStudents ? (
                <div className="loading">
                  <div className="spinner"></div> Loading data...
                </div>
              ) : (
                <StudentTable
                  students={filteredStudents}
                  showSurveyor={true}
                  onDelete={handleDeleteStudent}
                />
              )}
            </div>
          </div>
        )}

        {/* ── SURVEYORS TAB ── */}
        {tab === "surveyors" && (
          <div className="fade-in">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1rem",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => setShowAddSurveyor(true)}
              >
                ＋ Add Surveyor
              </button>
            </div>

            {loadingSurveyors ? (
              <div className="loading">
                <div className="spinner"></div> Loading surveyors...
              </div>
            ) : surveyors.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">👥</div>
                <div className="empty-text">
                  No surveyors found. Add one to get started.
                </div>
              </div>
            ) : (
              <div className="surveyor-grid">
                {surveyors.map((s) => (
                  <div key={s._id} className="surveyor-card fade-in">
                    <div className="surveyor-avatar">
                      {s.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="surveyor-info">
                      <div className="surveyor-name">{s.fullName}</div>
                      <div className="surveyor-username">@{s.username}</div>
                      <div style={{ marginTop: 6 }}>
                        <span
                          className={`badge ${s.isActive ? "badge-green" : "badge-red"}`}
                        >
                          {s.isActive ? "● Active" : "● Inactive"}
                        </span>
                      </div>
                      <div className="surveyor-actions">
                        <button
                          className={`btn btn-sm ${s.isActive ? "btn-secondary" : "btn-success"}`}
                          onClick={() => handleToggleSurveyor(s._id)}
                        >
                          {s.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteSurveyor(s._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADD STUDENT TAB ── */}
        {tab === "add" && (
          <div className="card fade-in">
            <div className="card-header">
              <div className="card-title">Add Student Manually</div>
              <span className="badge badge-amber">Admin Entry</span>
            </div>
            <div className="card-body">
              <StudentForm
                onSuccess={() => {
                  loadStudents();
                  setTab("students");
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── ADD SURVEYOR MODAL ── */}
      {showAddSurveyor && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setShowAddSurveyor(false)
          }
        >
          <div className="modal fade-in">
            <div className="modal-header">
              <div className="modal-title">Add New Surveyor</div>
              <button
                className="modal-close"
                onClick={() => setShowAddSurveyor(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddSurveyor} noValidate>
              <div className="modal-body">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      value={newSurveyor.fullName}
                      onChange={(e) => {
                        setNewSurveyor((s) => ({
                          ...s,
                          fullName: e.target.value,
                        }));
                        setSurveyorErrors((er) => ({ ...er, fullName: "" }));
                      }}
                      placeholder="e.g. Ravi Kumar"
                      className={surveyorErrors.fullName ? "input-error" : ""}
                    />
                    {surveyorErrors.fullName && (
                      <span className="field-error">
                        {surveyorErrors.fullName}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      value={newSurveyor.username}
                      onChange={(e) => {
                        setNewSurveyor((s) => ({
                          ...s,
                          username: e.target.value.toLowerCase(),
                        }));
                        setSurveyorErrors((er) => ({ ...er, username: "" }));
                      }}
                      placeholder="e.g. ravi_kumar (lowercase only)"
                      className={surveyorErrors.username ? "input-error" : ""}
                    />
                    {surveyorErrors.username && (
                      <span className="field-error">
                        {surveyorErrors.username}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={newSurveyor.password}
                      onChange={(e) => {
                        setNewSurveyor((s) => ({
                          ...s,
                          password: e.target.value,
                        }));
                        setSurveyorErrors((er) => ({ ...er, password: "" }));
                      }}
                      placeholder="Min 6 characters"
                      className={surveyorErrors.password ? "input-error" : ""}
                    />
                    {surveyorErrors.password && (
                      <span className="field-error">
                        {surveyorErrors.password}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddSurveyor(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingSurveyor}
                >
                  {savingSurveyor ? "Creating..." : "Create Surveyor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
