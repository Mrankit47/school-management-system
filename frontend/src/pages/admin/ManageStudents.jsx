import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 8;

const parseClassSection = (className) => {
  if (!className || className === "N/A")
    return { classLabel: "N/A", sectionLabel: "N/A" };
  const [classLabel, sectionLabel] = String(className)
    .split("-")
    .map((p) => p?.trim());
  return {
    classLabel: classLabel || "N/A",
    sectionLabel: sectionLabel || "N/A",
  };
};

const ageFromDob = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
};

const ageBucket = (age) => {
  if (age == null) return "Unknown";
  if (age <= 10) return "0-10";
  if (age <= 15) return "11-15";
  if (age <= 18) return "16-18";
  return "18+";
};

const sessionFromAdmissionDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "N/A";
  const y = d.getFullYear();
  const n = y + 1;
  return `${y}-${String(n).slice(-2)}`;
};

const regionFromAddress = (address) => {
  if (!address) return "Unknown";
  const parts = String(address)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || "Unknown";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const csvValue = (value) => {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyDeleteId, setBusyDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const defaultFilters = {
    activity: "",
    gender: "",
    age: "",
    region: "",
    session: "",
    category: "",
    className: "",
    sectionName: "",
    search: "",
  };
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, secRes] = await Promise.allSettled([
        api.get("students/"),
        api.get("classes/main-classes/"),
        api.get("classes/main-sections/"),
      ]);

      setStudents(sRes.status === "fulfilled" ? sRes.value?.data || [] : []);
      setClasses(cRes.status === "fulfilled" ? cRes.value?.data || [] : []);
      setSections(
        secRes.status === "fulfilled" ? secRes.value?.data || [] : [],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentsWithMeta = useMemo(
    () =>
      (students || []).map((s) => {
        const { classLabel, sectionLabel } = parseClassSection(s.class_name);
        const age = ageFromDob(s.dob);
        const activity = classLabel === "N/A" ? "Inactive" : "Active";
        return {
          ...s,
          classLabel,
          sectionLabel,
          age,
          ageLabel: ageBucket(age),
          activity,
          sessionName: sessionFromAdmissionDate(s.date_of_admission),
          region: regionFromAddress(s.address),
        };
      }),
    [students],
  );

  const options = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))];
    return {
      activity: ["Active", "Inactive"],
      gender: uniq(studentsWithMeta.map((s) => s.gender || "Unknown")),
      age: ["0-10", "11-15", "16-18", "18+", "Unknown"],
      region: uniq(studentsWithMeta.map((s) => s.region)),
      session: uniq(studentsWithMeta.map((s) => s.sessionName)),
      category: uniq(studentsWithMeta.map((s) => s.category || "N/A")),
      className: uniq([
        ...(classes || []).map((c) => c.name),
        ...studentsWithMeta.map((s) => s.classLabel),
      ]),
      sectionName: uniq([
        ...(sections || []).map((s) => s.name),
        ...studentsWithMeta.map((s) => s.sectionLabel),
      ]),
    };
  }, [studentsWithMeta, classes, sections]);

  const filtered = useMemo(() => {
    const q = (appliedFilters.search || "").trim().toLowerCase();
    return studentsWithMeta.filter((s) => {
      if (appliedFilters.activity && s.activity !== appliedFilters.activity)
        return false;
      if (
        appliedFilters.gender &&
        (s.gender || "Unknown") !== appliedFilters.gender
      )
        return false;
      if (appliedFilters.age && s.ageLabel !== appliedFilters.age) return false;
      if (appliedFilters.region && s.region !== appliedFilters.region)
        return false;
      if (appliedFilters.session && s.sessionName !== appliedFilters.session)
        return false;
      if (
        appliedFilters.category &&
        (s.category || "N/A") !== appliedFilters.category
      )
        return false;
      if (appliedFilters.className && s.classLabel !== appliedFilters.className)
        return false;
      if (
        appliedFilters.sectionName &&
        s.sectionLabel !== appliedFilters.sectionName
      )
        return false;

      if (q) {
        const haystack = [
          s.name,
          s.username,
          s.email,
          s.admission_number,
          s.father_name,
          s.mother_name,
          s.father_contact,
          s.mother_contact,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [studentsWithMeta, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pagedRows = filtered.slice(start, start + PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i += 1) nums.push(i);
    return nums;
  }, [totalPages]);

  const applySearch = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const clearAll = () => {
    setDraftFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const downloadCsv = () => {
    const rows = filtered || [];
    if (!rows.length) {
      window.alert("No student data to download.");
      return;
    }
    const headers = [
      "Student Name",
      "Session Name",
      "Gender",
      "DOB",
      "Class",
      "Section",
      "Father Name",
      "Mother Name",
      "Father Contact",
      "Mother Contact",
      "Status",
      "Admission Number",
      "Category",
      "Region",
    ];
    const lines = [headers.map(csvValue).join(",")];
    rows.forEach((s) => {
      lines.push(
        [
          s.name || "",
          s.sessionName || "",
          s.gender || "Unknown",
          formatDate(s.dob),
          s.classLabel || "",
          s.sectionLabel || "",
          s.father_name || "",
          s.mother_name || "",
          s.father_contact || "",
          s.mother_contact || "",
          s.activity || "",
          s.admission_number || "",
          s.category || "",
          s.region || "",
        ]
          .map(csvValue)
          .join(","),
      );
    });
    const csv = "\ufeff" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(`Delete student "${row?.name}"?`);
    if (!ok) return;
    setBusyDeleteId(row.id);
    try {
      await api.delete(`students/delete/${row.id}/`);
      await loadData();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed to delete student.");
    } finally {
      setBusyDeleteId(null);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editRow) return;
    setSavingEdit(true);
    try {
      await api.patch(`students/update/${editRow.id}/`, {
        first_name: editRow.first_name || "",
        last_name: editRow.last_name || "",
        name:
          `${editRow.first_name || ""} ${editRow.last_name || ""}`.trim() ||
          editRow.name,
        email: editRow.email || "",
        admission_number: editRow.admission_number || "",
        bus_no: editRow.bus_no || "",
        gender: editRow.gender || "",
        father_name: editRow.father_name || "",
        mother_name: editRow.mother_name || "",
        father_contact: editRow.father_contact || "",
        mother_contact: editRow.mother_contact || "",
        category: editRow.category || "",
      });
      setEditRow(null);
      await loadData();
    } catch (e2) {
      window.alert(e2?.response?.data?.error || "Failed to update student.");
    } finally {
      setSavingEdit(false);
    }
  };

  const shellCard = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    padding: 20,
  };

  const th = {
    textAlign: "left",
    fontWeight: 800,
    color: "#475569",
    whiteSpace: "nowrap",
    background: "#f1f5f9",
  };

  const td = {
    color: "#0f172a",
    borderTop: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const selectStyle = {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    backgroundColor: "#fff",
  };

  return (
    <div className="p-3 sm:p-6 bg-[#f1f5f9] min-h-full">
      <div className="bg-[#f8fafc] border border-slate-200 rounded-[18px] shadow-lg shadow-slate-900/5 p-4 sm:p-5">
        <h1 className="m-0 text-xl sm:text-3xl text-[#0f172a] font-bold">
          Student Management
        </h1>

        <div className="mt-3.5 flex flex-wrap gap-2 sm:gap-2.5">
          {[
            ["activity", "Activity", options.activity],
            ["gender", "Gender", options.gender],
            ["age", "Age", options.age],
            ["region", "Region", options.region],
            ["session", "Session", options.session],
            ["category", "Category", options.category],
            ["className", "Class", options.className],
            ["sectionName", "Section", options.sectionName],
          ].map(([key, label, opts]) => (
            <select
              key={key}
              value={draftFilters[key]}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, [key]: e.target.value }))
              }
              style={selectStyle}
              className="w-full sm:w-auto min-w-[120px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium"
            >
              <option value="">{label}</option>
              {(opts || []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}

          <button
            type="button"
            onClick={applySearch}
            style={selectStyle}
            className="w-full sm:w-auto min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-blue-700 text-white cursor-pointer font-bold"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearAll}
            style={selectStyle}
            className="w-full sm:w-auto min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white text-slate-600 cursor-pointer font-bold"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            style={selectStyle}
            className="w-full sm:w-auto min-w-[130px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-emerald-50 text-emerald-800 border-emerald-300 cursor-pointer font-bold"
          >
            Download CSV
          </button>
        </div>

        <div className="mt-3.5 relative w-full max-w-[420px]">
          <span
            style={{
              position: "absolute",
              left: 12,
              top: 10,
              color: "#94a3b8",
            }}
            className="text-xs sm:text-sm"
          >
            🔍
          </span>
          <input
            value={draftFilters.search}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, search: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            placeholder="Search student..."
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: 10,
              background: "#fff",
            }}
            className="pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all"
          />
        </div>
      </div>

      <div className="bg-[#f8fafc] border border-slate-200 rounded-[18px] shadow-lg shadow-slate-900/5 mt-3.5 overflow-hidden">
        {loading ? (
          <div className="p-4 sm:p-5 text-slate-400 font-bold text-xs sm:text-sm">
            Loading students...
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  minWidth: 1420,
                }}
              >
                <thead>
                  <tr>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">S.No</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Student ID</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Student Name</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Session Name</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Gender</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">DOB</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Class</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Section</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Father Name</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Father Contact</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Status</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        style={{ ...td, textAlign: "center" }}
                        className="text-xs sm:text-sm p-4 sm:p-5"
                      >
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((s, idx) => (
                      <tr
                        key={s.id}
                        style={{
                          background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                        }}
                      >
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{start + idx + 1}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.admission_number || "—"}</td>
                        <td style={{ ...td, fontWeight: 700 }} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          {s.name || "—"}
                        </td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.sessionName}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.gender || "Unknown"}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{formatDate(s.dob)}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.classLabel}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.sectionLabel}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.father_name || "—"}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{s.father_contact || "—"}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          <span
                            style={{
                              borderRadius: 999,
                              fontWeight: 700,
                              color:
                                s.activity === "Active" ? "#166534" : "#991b1b",
                              backgroundColor:
                                s.activity === "Active" ? "#dcfce7" : "#fee2e2",
                              border: `1px solid ${s.activity === "Active" ? "#86efac" : "#fecaca"}`,
                            }}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs"
                          >
                            {s.activity}
                          </span>
                        </td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          <div className="flex gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              title="View"
                              onClick={() => setViewRow(s)}
                              style={{
                                border: "1px solid #dbeafe",
                                background: "#eff6ff",
                                borderRadius: 8,
                                cursor: "pointer",
                              }}
                              className="p-1 sm:p-1.5 text-xs sm:text-sm hover:bg-blue-100 transition-colors"
                            >
                              👁️
                            </button>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => setEditRow({ ...s })}
                              style={{
                                border: "1px solid #d1fae5",
                                background: "#ecfdf5",
                                borderRadius: 8,
                                cursor: "pointer",
                              }}
                              className="p-1 sm:p-1.5 text-xs sm:text-sm hover:bg-emerald-100 transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              disabled={busyDeleteId === s.id}
                              onClick={() => handleDelete(s)}
                              style={{
                                border: "1px solid #fecaca",
                                background: "#fff1f2",
                                borderRadius: 8,
                                cursor: "pointer",
                                opacity: busyDeleteId === s.id ? 0.6 : 1,
                              }}
                              className="p-1 sm:p-1.5 text-xs sm:text-sm hover:bg-red-100 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (Mobile Application Style) */}
            <div className="block md:hidden space-y-3 p-1">
              {pagedRows.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-bold bg-white border border-slate-100 rounded-2xl">
                  No students found.
                </div>
              ) : (
                pagedRows.map((s, idx) => (
                  <div
                    key={s.id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3"
                  >
                    {/* Header: Name, Admission No, Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                          {s.name || "—"}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          ID: {s.admission_number || "—"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          s.activity === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {s.activity}
                      </span>
                    </div>

                    {/* Details Info Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-[10px] sm:text-[11px] text-slate-500 pt-1">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Class / Section
                        </span>
                        <span className="font-extrabold text-slate-700">
                          {s.classLabel} - {s.sectionLabel}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Session
                        </span>
                        <span className="font-extrabold text-slate-700">
                          {s.sessionName}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Father's Name
                        </span>
                        <span className="font-extrabold text-slate-700 truncate block">
                          {s.father_name || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Contact
                        </span>
                        <span className="font-extrabold text-slate-700">
                          {s.father_contact || "—"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setViewRow(s)}
                          className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditRow({ ...s })}
                          className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={busyDeleteId === s.id}
                        onClick={() => handleDelete(s)}
                        className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl text-[10px] font-black text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            background: "#fff",
          }}
          className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={selectStyle}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                style={{
                  border:
                    n === currentPage
                      ? "1px solid #2563eb"
                      : "1px solid #d1d5db",
                  background: n === currentPage ? "#2563eb" : "#fff",
                  color: n === currentPage ? "#fff" : "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
                className="w-7 h-7 sm:w-8.5 sm:h-8.5 text-xs sm:text-sm flex items-center justify-center rounded-lg"
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={selectStyle}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {viewRow && (
        <div
          style={{
            background: "rgba(15,23,42,0.45)",
            zIndex: 50,
          }}
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
        >
          <div
            style={{
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 16px 40px rgba(2,6,23,0.2)",
            }}
            className="w-full max-w-[540px] p-4 sm:p-5"
          >
            <h3 className="mt-0 mb-3 text-lg font-bold text-slate-800">Student Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600">
              <div>
                <b>Name:</b> {viewRow.name || "—"}
              </div>
              <div>
                <b>Admission:</b> {viewRow.admission_number || "—"}
              </div>
              <div>
                <b>Session:</b> {viewRow.sessionName}
              </div>
              <div>
                <b>Gender:</b> {viewRow.gender || "Unknown"}
              </div>
              <div>
                <b>Class:</b> {viewRow.classLabel}
              </div>
              <div>
                <b>Section:</b> {viewRow.sectionLabel}
              </div>
              <div>
                <b>Bus No:</b> {viewRow.bus_no || "N/A"}
              </div>
              <div>
                <b>Father's Name:</b> {viewRow.father_name || "—"}
              </div>
              <div>
                <b>Mother's Name:</b> {viewRow.mother_name || "—"}
              </div>
              <div>
                <b>Father's Contact:</b> {viewRow.father_contact || "—"}
              </div>
              <div>
                <b>Mother's Contact:</b> {viewRow.mother_contact || "—"}
              </div>
            </div>
            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setViewRow(null)}
                style={selectStyle}
                className="min-w-[90px] px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editRow && (
        <div
          style={{
            background: "rgba(15,23,42,0.45)",
            zIndex: 55,
          }}
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
        >
          <form
            onSubmit={saveEdit}
            style={{
              borderRadius: 16,
              background: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 16px 40px rgba(2,6,23,0.2)",
            }}
            className="w-full max-w-[640px] p-4 sm:p-5 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="mt-0 mb-3 text-lg font-bold text-slate-800">Edit Student</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <input
                value={editRow.first_name || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, first_name: e.target.value }))
                }
                placeholder="First name"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.last_name || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, last_name: e.target.value }))
                }
                placeholder="Last name"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.email || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Email"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.admission_number || ""}
                onChange={(e) =>
                  setEditRow((p) => ({
                    ...p,
                    admission_number: e.target.value,
                  }))
                }
                placeholder="Admission number"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.bus_no || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, bus_no: e.target.value }))
                }
                placeholder="Bus No."
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <select
                value={editRow.gender || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, gender: e.target.value }))
                }
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                value={editRow.father_name || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, father_name: e.target.value }))
                }
                placeholder="Father's name"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.mother_name || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, mother_name: e.target.value }))
                }
                placeholder="Mother's name"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.father_contact || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, father_contact: e.target.value }))
                }
                placeholder="Father's contact"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.mother_contact || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, mother_contact: e.target.value }))
                }
                placeholder="Mother's contact"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditRow(null)}
                style={selectStyle}
                className="min-w-[90px] px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                style={{
                  ...selectStyle,
                  background: "#1d4ed8",
                  color: "#fff",
                  borderColor: "#1d4ed8",
                }}
                className="min-w-[90px] px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
