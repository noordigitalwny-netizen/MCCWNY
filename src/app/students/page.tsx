"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredStudents, saveStoredStudents, getStoredMembers, Student, Member } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import {
  GraduationCap,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  X,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  User,
  BookOpen,
  Link2,
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    parent_name: "",
    phone_number: "",
    address: "",
    grade_level: "Grade 4",
    member_parent_id: "",
  });

  // Load from persistent storage on mount & hydrate from server store
  useEffect(() => {
    setStudents(getStoredStudents());
    setMembers(getStoredMembers());

    fetch("/api/store")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.students && data.students.length > 0) {
            setStudents(data.students);
            if (typeof window !== "undefined") {
              localStorage.setItem("mccwny_students", JSON.stringify(data.students));
            }
          }
          if (data.members && data.members.length > 0) {
            setMembers(data.members);
            if (typeof window !== "undefined") {
              localStorage.setItem("mccwny_members", JSON.stringify(data.members));
            }
          }
        }
      })
      .catch((err) => console.error("Server store fetch error:", err));
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter & Search
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone_number.includes(searchTerm) ||
      s.grade_level.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === "all" || s.grade_level === gradeFilter;

    return matchesSearch && matchesGrade;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAddModal = () => {
    setFormData({
      first_name: "",
      last_name: "",
      parent_name: "",
      phone_number: "",
      address: "",
      grade_level: "Grade 4",
      member_parent_id: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      parent_name: student.parent_name,
      phone_number: student.phone_number,
      address: student.address,
      grade_level: student.grade_level,
      member_parent_id: student.member_parent_id || "",
    });
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.parent_name) return;

    let updatedList: Student[];
    if (editingStudent) {
      // Update
      updatedList = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              first_name: formData.first_name,
              last_name: formData.last_name,
              parent_name: formData.parent_name,
              phone_number: formData.phone_number,
              address: formData.address,
              grade_level: formData.grade_level,
              member_parent_id: formData.member_parent_id || null,
            }
          : s
      );
      showNotification(`Student "${formData.first_name} ${formData.last_name}" updated.`);
      setEditingStudent(null);
    } else {
      // Create new
      const newStu: Student = {
        id: `stu-${Date.now()}`,
        first_name: formData.first_name,
        last_name: formData.last_name,
        parent_name: formData.parent_name,
        phone_number: formData.phone_number || "N/A",
        address: formData.address || "N/A",
        grade_level: formData.grade_level,
        member_parent_id: formData.member_parent_id || null,
        created_at: new Date().toISOString(),
      };
      updatedList = [newStu, ...students];
      showNotification(`Student "${newStu.first_name} ${newStu.last_name}" enrolled successfully.`);
      setIsAddModalOpen(false);
    }

    setStudents(updatedList);
    saveStoredStudents(updatedList);
  };

  const handleDeleteStudent = () => {
    if (!deletingStudent) return;
    const updatedList = students.filter((s) => s.id !== deletingStudent.id);
    setStudents(updatedList);
    saveStoredStudents(updatedList);
    showNotification(`Student "${deletingStudent.first_name} ${deletingStudent.last_name}" removed.`);
    setDeletingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Students Roster
            </h1>
            <p className="text-xs text-slate-500">
              Manage Sunday School & Quranic Academy enrollments (Cross-Session Sync)
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-900/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search student, parent, phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Grade Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["all", "Kindergarten", "Grade 2", "Grade 4", "Grade 6", "Grade 8"].map((grade) => (
            <button
              key={grade}
              onClick={() => {
                setGradeFilter(grade);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                gradeFilter === grade
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {grade === "all" ? "All Grades" : grade}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Parent Name</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Grade Level</th>
                <th className="px-6 py-4">Linked Member</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedStudents.map((s) => {
                const linkedMember = members.find((m) => m.id === s.member_parent_id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold text-xs flex items-center justify-center border border-purple-300 dark:border-purple-800">
                          {s.first_name[0]}
                        </div>
                        <Link
                          href={`/students/${s.id}`}
                          className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline"
                        >
                          {s.first_name} {s.last_name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.parent_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.phone_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-[11px]">
                        <BookOpen className="w-3 h-3" />
                        {s.grade_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {linkedMember ? (
                        <Link
                          href={`/members/${linkedMember.id}`}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium hover:underline"
                        >
                          <Link2 className="w-3 h-3" />
                          {linkedMember.first_name} {linkedMember.last_name}
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-normal">Unlinked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/students/${s.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors"
                          title="View Student Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                          title="Edit Student"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudent(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page {validPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={validPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={validPage >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 font-semibold flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Dialog */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingStudent(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {editingStudent ? "Edit Student Record" : "Enroll New Student"}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Fill in student details and optionally link to a registered member parent.
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Yousef"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Mansoor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  placeholder="Tariq Mansoor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Optional Searchable Dropdown linking student to members table */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Link to Member Parent (Optional)</span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">FK -&gt; members.id</span>
                </label>
                <select
                  value={formData.member_parent_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const linkedMem = members.find((m) => m.id === selectedId);
                    setFormData({
                      ...formData,
                      member_parent_id: selectedId,
                      parent_name: linkedMem ? `${linkedMem.first_name} ${linkedMem.last_name}` : formData.parent_name,
                      phone_number: linkedMem ? linkedMem.phone : formData.phone_number,
                      address: linkedMem ? linkedMem.address : formData.address,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- No Member Profile Linked --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="(716) 555-0182"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="142 Amherst St, Buffalo, NY"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md"
                >
                  {editingStudent ? "Update Student" : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Student Enrollment?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove <strong className="text-slate-800 dark:text-slate-200">{deletingStudent.first_name} {deletingStudent.last_name}</strong>?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md w-full"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
