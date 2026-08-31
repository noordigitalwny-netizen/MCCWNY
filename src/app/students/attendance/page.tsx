"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Student, Attendance } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import { exportToExcel } from "@/lib/excel";
import {
  GraduationCap,
  CalendarCheck,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  Filter,
  UserCheck,
  UserX,
  Users,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function StudentAttendancePage() {
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Controls State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [genderFilter, setGenderFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Attendance Records State for selected day: Map of student_id -> "Present" | "Absent"
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Present" | "Absent">>({});

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Students & Attendance for Selected Date
  const fetchStudentsAndAttendance = async (dateStr: string) => {
    setLoading(true);
    try {
      const [stuRes, attRes] = await Promise.all([
        supabase.from("students").select("*").order("first_name", { ascending: true }),
        supabase.from("attendance").select("*").eq("date", dateStr),
      ]);

      if (stuRes.error) throw stuRes.error;
      if (attRes.error) throw attRes.error;

      if (stuRes.data) setStudents(stuRes.data as Student[]);

      // Map attendance records by student_id
      const newMap: Record<string, "Present" | "Absent"> = {};
      if (attRes.data) {
        (attRes.data as Attendance[]).forEach((rec) => {
          newMap[rec.student_id] = rec.status;
        });
      }
      setAttendanceMap(newMap);
    } catch (err: any) {
      console.error("Supabase fetch error:", err);
      showToast(err.message || "Failed to load attendance from Supabase.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndAttendance(selectedDate);
  }, [selectedDate]);

  // Search & Gender Filter Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.grade_level && s.grade_level.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGender = genderFilter === "All" || (s.gender || "Boy") === genderFilter;

    return matchesSearch && matchesGender;
  });

  // Export Full Month Attendance Sheet to Excel Matrix (.xlsx)
  const handleExportAttendance = async () => {
    if (filteredStudents.length === 0) {
      showToast("No student records to export.", "error");
      return;
    }

    setExporting(true);

    try {
      // 1. Determine Full Month Range strictly without timezone shifts
      const [yearStr, monthStr] = selectedDate.split("-");
      const yearNum = parseInt(yearStr, 10);
      const monthIdx = parseInt(monthStr, 10) - 1; // 0-indexed

      // Last day of selected month (e.g., 31 for August)
      const daysInMonth = new Date(yearNum, monthIdx + 1, 0).getDate();

      const startDateStr = `${yearStr}-${monthStr}-01`;
      const endDateStr = `${yearStr}-${monthStr}-${String(daysInMonth).padStart(2, "0")}`;

      // 2. Fetch full month attendance records from Supabase
      const { data: monthAttData, error } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", startDateStr)
        .lte("date", endDateStr);

      if (error) throw error;

      // 3. Map Attendance Records: student_id -> dayNumber (1..31) -> "Present" | "Absent"
      // Strict local date parsing via string splitting to prevent timezone shifts!
      const studentMonthAttMap: Record<string, Record<number, "Present" | "Absent">> = {};

      if (monthAttData) {
        (monthAttData as Attendance[]).forEach((rec) => {
          if (!rec.date) return;
          const [, , dStr] = rec.date.split("-");
          const dayNum = parseInt(dStr, 10);
          if (!studentMonthAttMap[rec.student_id]) {
            studentMonthAttMap[rec.student_id] = {};
          }
          studentMonthAttMap[rec.student_id][dayNum] = rec.status;
        });
      }

      // 4. Build Monthly Attendance Grid Matrix
      const exportData = filteredStudents.map((s) => {
        const row: Record<string, any> = {
          "First Name": s.first_name,
          "Last Name": s.last_name,
          "Gender": s.gender || "Boy",
          "Grade": s.grade_level || "Grade 1",
          "Parent Name": s.parent_name,
          "Phone Number": s.phone_number || "—",
        };

        let presentTotal = 0;
        let absentTotal = 0;

        // Generate columns for every day in the month (1..daysInMonth)
        for (let day = 1; day <= daysInMonth; day++) {
          const status = studentMonthAttMap[s.id]?.[day];
          if (status === "Present") {
            row[String(day)] = "P";
            presentTotal++;
          } else if (status === "Absent") {
            row[String(day)] = "A";
            absentTotal++;
          } else {
            row[String(day)] = ""; // Blank if no record
          }
        }

        // Summary columns
        row["Total Present"] = presentTotal;
        row["Total Absent"] = absentTotal;
        const totalMarked = presentTotal + absentTotal;
        row["Attendance %"] =
          totalMarked > 0 ? `${Math.round((presentTotal / totalMarked) * 100)}%` : "N/A";

        return row;
      });

      // 5. Generate Excel workbook with dynamic filename
      const monthNameStr = monthNames[monthIdx] || "Month";
      const fileName = `Student_Attendance_${monthNameStr}_${yearStr}.xlsx`;

      exportToExcel(exportData, fileName, `Attendance ${monthNameStr}`);
      showToast(`Exported ${fileName} successfully.`);
    } catch (err: any) {
      console.error("Export error:", err);
      showToast(err.message || "Failed to export attendance matrix.", "error");
    } finally {
      setExporting(false);
    }
  };

  // Execute Auto-Save Upsert to Supabase
  const handleToggleAttendance = async (student: Student, newStatus: "Present" | "Absent") => {
    const currentStatus = attendanceMap[student.id];
    if (currentStatus === newStatus) return; // Already set to this status

    // Optimistic UI Update
    setAttendanceMap((prev) => ({ ...prev, [student.id]: newStatus }));
    setSavingId(student.id);

    try {
      const { error } = await supabase.from("attendance").upsert(
        {
          student_id: student.id,
          date: selectedDate,
          status: newStatus,
        },
        { onConflict: "student_id, date" }
      );

      if (error) throw error;

      showToast(
        `Marked ${student.first_name} ${student.last_name} as ${newStatus} for ${formatDate(selectedDate)}.`
      );
    } catch (err: any) {
      // Revert on error
      if (currentStatus) {
        setAttendanceMap((prev) => ({ ...prev, [student.id]: currentStatus }));
      } else {
        setAttendanceMap((prev) => {
          const updated = { ...prev };
          delete updated[student.id];
          return updated;
        });
      }
      showToast(err.message || "Failed to save attendance.", "error");
    } finally {
      setSavingId(null);
    }
  };

  // Bulk Mark All Filtered Students (Present or Absent)
  const handleBulkMark = async (newStatus: "Present" | "Absent") => {
    if (filteredStudents.length === 0) return;

    const upsertRows = filteredStudents.map((s) => ({
      student_id: s.id,
      date: selectedDate,
      status: newStatus,
    }));

    // Optimistic UI Update
    const newMap = { ...attendanceMap };
    filteredStudents.forEach((s) => {
      newMap[s.id] = newStatus;
    });
    setAttendanceMap(newMap);

    try {
      const { error } = await supabase
        .from("attendance")
        .upsert(upsertRows, { onConflict: "student_id, date" });

      if (error) throw error;

      showToast(
        `Marked all ${filteredStudents.length} displayed students as ${newStatus}.`
      );
    } catch (err: any) {
      showToast(err.message || "Failed bulk attendance update.", "error");
      fetchStudentsAndAttendance(selectedDate);
    }
  };

  // Metrics calculation
  const totalFilteredCount = filteredStudents.length;
  const presentCount = filteredStudents.filter((s) => attendanceMap[s.id] === "Present").length;
  const absentCount = filteredStudents.filter((s) => attendanceMap[s.id] === "Absent").length;
  const unmarkedCount = Math.max(0, totalFilteredCount - presentCount - absentCount);
  const attendancePercentage =
    totalFilteredCount > 0 ? Math.round((presentCount / totalFilteredCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/students"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Roster
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Daily Student Attendance Tracker
              </h1>
              <p className="text-xs text-slate-500">
                Live attendance roll call connected to Supabase public.attendance table
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportAttendance}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? "Generating Excel..." : "Export to Excel"}</span>
          </button>

          <Link
            href="/students/payments"
            className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 font-semibold text-xs transition-all border border-purple-300 dark:border-purple-800 flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Monthly Payment Tracker</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 border transition-all ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalFilteredCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Active in selected filter
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Present Today
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {presentCount}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {attendancePercentage}% attendance rate
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Absent Today
            </p>
            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {absentCount}
            </h3>
            <p className="text-[11px] text-rose-500 mt-1">Absence records saved</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Unmarked / Pending
            </p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {unmarkedCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Click to toggle roll call</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Date Picker, Gender Filter & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Date Picker & Gender Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-bold text-slate-700 dark:text-slate-300">Attendance Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Genders</option>
              <option value="Boy">Boys Only</option>
              <option value="Girl">Girls Only</option>
            </select>
          </div>
        </div>

        {/* Right Side: Search Input & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student or parent..."
              className="w-full pl-10 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleBulkMark("Present")}
              className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 font-semibold text-xs transition-all border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => handleBulkMark("Absent")}
              className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 font-semibold text-xs transition-all border border-rose-300 dark:border-rose-800 flex items-center gap-1"
            >
              <UserX className="w-3.5 h-3.5 text-rose-600" />
              <span>Mark All Absent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster View Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Querying attendance records for {formatDate(selectedDate)}...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-purple-500 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No students found
            </h3>
            <p className="text-xs text-slate-500">
              {searchTerm || genderFilter !== "All"
                ? "No student matched your search query or gender filter."
                : "Your academy roster is empty. Enroll students in the Students tab."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4">Parent / Guardian</th>
                  <th className="px-6 py-4 text-center">
                    Attendance Status ({formatDate(selectedDate)})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((s) => {
                  const status = attendanceMap[s.id];
                  const isSaving = savingId === s.id;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Student Name */}
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold text-xs flex items-center justify-center border border-purple-300 dark:border-purple-800">
                            {s.first_name?.[0]}
                            {s.last_name?.[0]}
                          </div>
                          <Link
                            href={`/students/${s.id}`}
                            className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                          >
                            {s.first_name} {s.last_name}
                          </Link>
                        </div>
                      </td>

                      {/* Gender Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            (s.gender || "Boy") === "Boy"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                              : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:border-fuchsia-800"
                          }`}
                        >
                          {s.gender || "Boy"}
                        </span>
                      </td>

                      {/* Grade Level */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                          {s.grade_level || "Grade 1"}
                        </span>
                      </td>

                      {/* Parent Info */}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.parent_name}
                        </p>
                        {s.phone_number && (
                          <p className="text-[11px] text-slate-400 font-mono">
                            {s.phone_number}
                          </p>
                        )}
                      </td>

                      {/* Interactive Attendance Toggle Switch */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 gap-1">
                          {/* Present Button */}
                          <button
                            onClick={() => handleToggleAttendance(s, "Present")}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              status === "Present"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-500/40"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            onClick={() => handleToggleAttendance(s, "Absent")}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              status === "Absent"
                                ? "bg-rose-600 text-white shadow-md shadow-rose-900/30 ring-2 ring-rose-500/40"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
