import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 8;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const yearsBucket = (n) => {
  if (n == null || n === "" || Number.isNaN(Number(n))) return "Unknown";
  const v = Number(n);
  if (v <= 1) return "0-1";
  if (v <= 3) return "2-3";
  if (v <= 5) return "4-5";
  return "6+";
};

const csvValue = (value) => {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyDeleteId, setBusyDeleteId] = useState(null);
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const defaultFilters = {
    status: "",
    gender: "",
    specialization: "",
    experience: "",
    qualification: "",
    search: "",
  };
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get("teachers/");
      setTeachers(res.data || []);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const teachersWithMeta = useMemo(
    () =>
      (teachers || []).map((t) => ({
        ...t,
        experienceLabel: yearsBucket(t.experience_years),
        statusLabel: t.status || "Active",
        genderLabel: t.gender || "Unknown",
        specializationLabel: t.subject_specialization || "N/A",
        qualificationLabel: t.qualification || "N/A",
      })),
    [teachers],
  );

  const options = useMemo(() => {
    const uniq = (arr) => [...new Set(arr.filter(Boolean))];
    return {
      status: uniq(teachersWithMeta.map((t) => t.statusLabel)),
      gender: uniq(teachersWithMeta.map((t) => t.genderLabel)),
      specialization: uniq(teachersWithMeta.map((t) => t.specializationLabel)),
      experience: ["0-1", "2-3", "4-5", "6+", "Unknown"],
      qualification: uniq(teachersWithMeta.map((t) => t.qualificationLabel)),
    };
  }, [teachersWithMeta]);

  const filtered = useMemo(() => {
    const q = (appliedFilters.search || "").trim().toLowerCase();
    return teachersWithMeta.filter((t) => {
      if (appliedFilters.status && t.statusLabel !== appliedFilters.status)
        return false;
      if (appliedFilters.gender && t.genderLabel !== appliedFilters.gender)
        return false;
      if (
        appliedFilters.specialization &&
        t.specializationLabel !== appliedFilters.specialization
      )
        return false;
      if (
        appliedFilters.experience &&
        t.experienceLabel !== appliedFilters.experience
      )
        return false;
      if (
        appliedFilters.qualification &&
        t.qualificationLabel !== appliedFilters.qualification
      )
        return false;
      if (q) {
        const haystack = [
          t.employee_id,
          t.name,
          t.email,
          t.phone_number,
          t.subject_specialization,
          t.qualification,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [teachersWithMeta, appliedFilters]);

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
      window.alert("No teacher data to download.");
      return;
    }
    const headers = [
      "Employee ID",
      "Teacher Name",
      "Specialization",
      "Email",
      "Phone",
      "Gender",
      "DOB",
      "Qualification",
      "Experience",
      "Joining Date",
      "Status",
    ];
    const lines = [headers.map(csvValue).join(",")];
    rows.forEach((t) => {
      lines.push(
        [
          t.employee_id || "",
          t.name || "",
          t.specializationLabel || "",
          t.email || "",
          t.phone_number || "",
          t.genderLabel || "",
          formatDate(t.dob),
          t.qualificationLabel || "",
          t.experience_years ?? "",
          formatDate(t.joining_date),
          t.statusLabel || "",
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
    a.download = `teachers-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (row) => {
    const ok = window.confirm(`Delete teacher "${row?.name}"?`);
    if (!ok) return;
    setBusyDeleteId(row.id);
    try {
      await api.delete(`teachers/delete/${row.id}/`);
      await loadTeachers();
    } catch (e) {
      window.alert(e?.response?.data?.error || "Failed to delete teacher.");
    } finally {
      setBusyDeleteId(null);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editRow) return;
    setSavingEdit(true);
    try {
      await api.patch(`teachers/update/${editRow.id}/`, {
        email: editRow.email || "",
        name: editRow.name || "",
        employee_id: editRow.employee_id || "",
        subject_specialization: editRow.subject_specialization || "",
        phone_number: editRow.phone_number || "",
        gender: editRow.gender || "",
        dob: editRow.dob || null,
        qualification: editRow.qualification || "",
        experience_years:
          editRow.experience_years === "" ? null : editRow.experience_years,
        joining_date: editRow.joining_date || null,
        role: editRow.role || "Subject Teacher",
        status: editRow.status || "Active",
      });
      setEditRow(null);
      await loadTeachers();
    } catch (e2) {
      window.alert(e2?.response?.data?.error || "Failed to update teacher.");
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
    fontSize: 13,
    fontWeight: 800,
    color: "#475569",
    padding: "13px 12px",
    whiteSpace: "nowrap",
    background: "#f1f5f9",
  };

  const td = {
    fontSize: 14,
    color: "#0f172a",
    padding: "13px 12px",
    borderTop: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const selectStyle = {
    minWidth: 140,
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  };

  return (
    <div className="p-3 sm:p-6 bg-[#f1f5f9] min-h-full">
      <div className="bg-[#f8fafc] border border-slate-200 rounded-[18px] shadow-lg shadow-slate-900/5 p-4 sm:p-5">
        <h1 className="m-0 text-xl sm:text-3xl text-[#0f172a] font-bold">
          Teacher Management
        </h1>

        <div className="mt-3.5 flex flex-wrap gap-2 sm:gap-2.5">
          {[
            ["status", "Status", options.status],
            ["gender", "Gender", options.gender],
            ["specialization", "Specialization", options.specialization],
            ["experience", "Experience", options.experience],
            ["qualification", "Qualification", options.qualification],
          ].map(([key, label, opts]) => (
            <select
              key={key}
              value={draftFilters[key]}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, [key]: e.target.value }))
              }
              style={selectStyle}
              className="w-full sm:w-auto min-w-[140px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm cursor-pointer font-bold"
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
            className="w-full sm:w-auto min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white cursor-pointer font-bold rounded-xl border border-blue-600 hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="w-full sm:w-auto min-w-[100px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white text-slate-600 cursor-pointer font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="w-full sm:w-auto min-w-[130px] px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-pointer font-bold rounded-xl hover:bg-emerald-100/50 transition-colors"
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
            placeholder="Search teacher..."
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
            Loading teachers...
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
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Employee ID</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Teacher Name</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Specialization</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Email</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Phone</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Gender</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">DOB</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Qualification</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Experience</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Joining Date</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Role</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Status</th>
                    <th style={th} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={14}
                        style={{ ...td, textAlign: "center" }}
                        className="text-xs sm:text-sm p-4 sm:p-5"
                      >
                        No teachers found.
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((t, idx) => (
                      <tr
                        key={t.id}
                        style={{
                          background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                        }}
                      >
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{start + idx + 1}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.employee_id || "—"}</td>
                        <td style={{ ...td, fontWeight: 700 }} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          {t.name || "—"}
                        </td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.specializationLabel}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.email || "—"}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.phone_number || "—"}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.genderLabel}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{formatDate(t.dob)}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.qualificationLabel}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{t.experience_years ?? "—"}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">{formatDate(t.joining_date)}</td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              backgroundColor:
                                t.role === "Class Teacher"
                                  ? "#eff6ff"
                                  : "#f8fafc",
                              color:
                                t.role === "Class Teacher"
                                  ? "#1d4ed8"
                                  : "#64748b",
                              border: `1px solid ${t.role === "Class Teacher" ? "#bfdbfe" : "#e2e8f0"}`,
                            }}
                          >
                            {t.role || "Subject Teacher"}
                          </span>
                        </td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontWeight: 700,
                              fontSize: 11,
                              color:
                                String(t.statusLabel).toLowerCase() === "active"
                                  ? "#166534"
                                  : "#991b1b",
                              backgroundColor:
                                String(t.statusLabel).toLowerCase() === "active"
                                  ? "#dcfce7"
                                  : "#fee2e2",
                              border: `1px solid ${String(t.statusLabel).toLowerCase() === "active" ? "#86efac" : "#fecaca"}`,
                            }}
                          >
                            {t.statusLabel}
                          </span>
                        </td>
                        <td style={td} className="text-xs sm:text-sm px-2.5 py-2 sm:px-3 sm:py-3.5">
                          <div className="flex gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              title="View"
                              onClick={() => setViewRow(t)}
                              style={{
                                border: "1px solid #dbeafe",
                                background: "#eff6ff",
                                borderRadius: 8,
                                cursor: "pointer",
                                padding: "6px 9px",
                              }}
                            >
                              👁️
                            </button>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => setEditRow({ ...t })}
                              style={{
                                border: "1px solid #d1fae5",
                                background: "#ecfdf5",
                                borderRadius: 8,
                                cursor: "pointer",
                                padding: "6px 9px",
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              disabled={busyDeleteId === t.id}
                              onClick={() => handleDelete(t)}
                              style={{
                                border: "1px solid #fecaca",
                                background: "#fff1f2",
                                borderRadius: 8,
                                cursor: "pointer",
                                padding: "6px 9px",
                                opacity: busyDeleteId === t.id ? 0.6 : 1,
                              }}
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
                  No teachers found.
                </div>
              ) : (
                pagedRows.map((t, idx) => (
                  <div
                    key={t.id}
                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3"
                  >
                    {/* Header: Name, Employee ID, Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                          {t.name || "—"}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          ID: {t.employee_id || "—"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          String(t.statusLabel).toLowerCase() === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {t.statusLabel}
                      </span>
                    </div>

                    {/* Details Info Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-[10px] sm:text-[11px] text-slate-500 pt-1">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Specialization
                        </span>
                        <span className="font-extrabold text-slate-700">
                          {t.specializationLabel}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Role
                        </span>
                        <span className="font-extrabold text-slate-700">
                          {t.role || "Subject Teacher"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Qualification
                        </span>
                        <span className="font-extrabold text-slate-700 truncate block">
                          {t.qualificationLabel}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase tracking-tight text-[9px] mb-0.5">
                          Experience
                        </span>
                        <span className="font-extrabold text-slate-700">
                          {t.experience_years ?? "0"} Years
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setViewRow(t)}
                          className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditRow({ ...t })}
                          className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={busyDeleteId === t.id}
                        onClick={() => handleDelete(t)}
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

        <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4 border-t border-slate-200 bg-white">
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
            <h3 className="mt-0 mb-3 text-lg font-bold text-slate-800">Teacher Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600">
              <div>
                <b>Name:</b> {viewRow.name || "—"}
              </div>
              <div>
                <b>Employee ID:</b> {viewRow.employee_id || "—"}
              </div>
              <div>
                <b>Email:</b> {viewRow.email || "—"}
              </div>
              <div>
                <b>Phone:</b> {viewRow.phone_number || "—"}
              </div>
              <div>
                <b>Specialization:</b> {viewRow.specializationLabel}
              </div>
              <div>
                <b>Qualification:</b> {viewRow.qualificationLabel}
              </div>
              <div>
                <b>Experience:</b> {viewRow.experience_years ?? "—"}
              </div>
              <div>
                <b>Role:</b> {viewRow.role || "Subject Teacher"}
              </div>
              <div>
                <b>Status:</b> {viewRow.statusLabel}
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
            <h3 className="mt-0 mb-3 text-lg font-bold text-slate-800">Edit Teacher</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <input
                value={editRow.name || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Full name"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.employee_id || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, employee_id: e.target.value }))
                }
                placeholder="Employee ID"
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
                value={editRow.phone_number || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, phone_number: e.target.value }))
                }
                placeholder="Phone number"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.subject_specialization || ""}
                onChange={(e) =>
                  setEditRow((p) => ({
                    ...p,
                    subject_specialization: e.target.value,
                  }))
                }
                placeholder="Specialization"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                value={editRow.qualification || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, qualification: e.target.value }))
                }
                placeholder="Qualification"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                type="number"
                min="0"
                value={editRow.experience_years ?? ""}
                onChange={(e) =>
                  setEditRow((p) => ({
                    ...p,
                    experience_years: e.target.value,
                  }))
                }
                placeholder="Experience years"
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                type="date"
                value={editRow.joining_date || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, joining_date: e.target.value }))
                }
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              />
              <input
                type="date"
                value={editRow.dob || ""}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, dob: e.target.value }))
                }
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
              <select
                value={editRow.status || "Active"}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, status: e.target.value }))
                }
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <select
                value={editRow.role || "Subject Teacher"}
                onChange={(e) =>
                  setEditRow((p) => ({ ...p, role: e.target.value }))
                }
                style={selectStyle}
                className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all"
              >
                <option value="Subject Teacher">Subject Teacher</option>
                <option value="Class Teacher">Class Teacher</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                style={selectStyle}
                className="min-w-[90px] px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
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

export default ManageTeachers;
