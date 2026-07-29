import React, { useState, useEffect, useRef } from 'react';
import userService from '../services/userService';
import teamService from '../services/teamService';
import toast from 'react-hot-toast';

function extractErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.Message === "string") return data.Message;
  if (typeof data?.title === "string") return data.title;
  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }
  if (typeof error?.message === "string") return error.message;

  return "Unknown error";
}

const AddTeamMemberSearch = ({ teamId, currentMembers = [], onMemberAdded, variant = 'modal' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    const fetchAvailable = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await userService.getAvailableStudentsForTeam();
        const rawUsers = Array.isArray(data) ? data : (data?.data || []);
        
        const normalized = rawUsers.map(u => {
          const id = Number(u.userID ?? u.UserID ?? u.id ?? u.Id);
          const fullName = u.fullName ?? u.FullName ?? u.name ?? u.Name ?? "مستخدم بدون اسم";
          const email = u.email ?? u.Email ?? "";
          const userName = u.userName ?? u.UserName ?? u.username ?? u.Username ?? "";
          const studentNumber = u.studentNumber ?? u.StudentNumber ?? "";
          const departmentName = u.departmentName ?? u.DepartmentName ?? "";
          return { id, fullName, email, userName, studentNumber, departmentName };
        }).filter(u => Number.isInteger(u.id) && u.id > 0);

        setAvailableUsers(normalized);
      } catch (err) {
        console.error("Error loading available students:", err);
        setError("تعذر البحث عن الطلاب");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailable();
  }, [teamId]);

  // Click outside listener to hide search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
    if (selectedUser && e.target.value !== selectedUser.fullName) {
      setSelectedUser(null);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.fullName);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setSearchQuery('');
  };

  // Filter logic
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isQueryValid = trimmedQuery.length >= 2;

  // Compile current team members set to exclude them (safely matching string names or numeric IDs)
  const currentMemberNames = new Set(
    currentMembers.map(m => {
      if (typeof m === 'string') return m.trim().toLowerCase();
      if (typeof m === 'object') return (m.fullName ?? m.FullName ?? m.name ?? m.Name ?? '').trim().toLowerCase();
      return '';
    }).filter(Boolean)
  );

  const currentMemberIds = new Set(
    currentMembers.map(m => {
      if (typeof m === 'object') return Number(m.userID ?? m.UserID ?? m.id);
      return NaN;
    }).filter(id => !isNaN(id))
  );

  const filteredUsers = availableUsers
    .filter(u => {
      // Exclude if already in the team members list
      if (currentMemberIds.has(u.id)) return false;
      if (currentMemberNames.has(u.fullName.trim().toLowerCase())) return false;
      return true;
    })
    .filter(u => {
      if (!isQueryValid) return false;
      return (
        u.fullName?.toLowerCase().includes(trimmedQuery) ||
        u.email?.toLowerCase().includes(trimmedQuery) ||
        u.userName?.toLowerCase().includes(trimmedQuery) ||
        u.studentNumber?.toLowerCase().includes(trimmedQuery) ||
        u.departmentName?.toLowerCase().includes(trimmedQuery) ||
        String(u.id).includes(trimmedQuery)
      );
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tId = Number(teamId);
    if (!tId || !Number.isInteger(tId) || tId <= 0) {
      toast.error("معرف الفريق غير صحيح");
      return;
    }

    if (!selectedUser) {
      toast.error("يرجى اختيار طالب من نتائج البحث");
      return;
    }

    const uId = Number(selectedUser.id);
    if (!uId || !Number.isInteger(uId) || uId <= 0) {
      toast.error("معرف الطالب غير صحيح");
      return;
    }

    setIsSubmitting(true);
    try {
      await teamService.addMember(tId, uId);
      toast.success("تمت إضافة الطالب للفريق بنجاح");
      
      // Clear inputs
      setSelectedUser(null);
      setSearchQuery('');
      
      // Refresh available list
      const data = await userService.getAvailableStudentsForTeam();
      const rawUsers = Array.isArray(data) ? data : (data?.data || []);
      const normalized = rawUsers.map(u => {
        const id = Number(u.userID ?? u.UserID ?? u.id ?? u.Id);
        const fullName = u.fullName ?? u.FullName ?? u.name ?? u.Name ?? "مستخدم بدون اسم";
        const email = u.email ?? u.Email ?? "";
        const userName = u.userName ?? u.UserName ?? u.username ?? u.Username ?? "";
        const studentNumber = u.studentNumber ?? u.StudentNumber ?? "";
        const departmentName = u.departmentName ?? u.DepartmentName ?? "";
        return { id, fullName, email, userName, studentNumber, departmentName };
      }).filter(u => Number.isInteger(u.id) && u.id > 0);
      setAvailableUsers(normalized);

      if (onMemberAdded) {
        onMemberAdded(uId);
      }
    } catch (err) {
      console.error("Add member search error:", err);
      const errorMsg = extractErrorMessage(err);

      if (errorMsg.includes("already in this team")) {
        toast.error("الطالب موجود بالفعل في هذا الفريق");
      } else if (errorMsg.includes("User already in team") || errorMsg.includes("already in a team") || errorMsg.includes("already exists")) {
        toast.error("الطالب موجود بالفعل في فريق");
      } else if (errorMsg.includes("Team is full")) {
        toast.error("الفريق مكتمل");
      } else if (errorMsg.includes("Team not found")) {
        toast.error("لم يتم العثور على الفريق");
      } else if (errorMsg.includes("User not found")) {
        toast.error("لم يتم العثور على الطالب");
      } else if (errorMsg.includes("Only team leader")) {
        toast.error("فقط قائد الفريق يمكنه إضافة أعضاء");
      } else {
        toast.error("تعذر إضافة الطالب للفريق");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic CSS configuration depending on the visual theme variant
  const classes = {
    sidebar: {
      label: "block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2",
      input: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all",
      searchIcon: "absolute right-3 top-3.5 text-slate-400 text-base material-symbols-outlined",
      resultsPanel: "absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto text-slate-800 dark:text-white",
      resultRow: "p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors cursor-pointer text-right flex flex-col gap-0.5",
      resultName: "text-xs font-bold text-slate-900 dark:text-white",
      resultSub: "text-[10px] text-slate-500 dark:text-slate-400",
      infoText: "text-xs text-slate-500 dark:text-slate-400 py-2.5 px-4 text-right",
      selectionBanner: "p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-primary dark:text-primary-light flex items-center justify-between gap-3 text-right mb-4",
      selectionLabel: "text-xs font-bold",
      selectionSub: "text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5",
      clearBtn: "p-1.5 hover:bg-primary/10 rounded-lg text-primary hover:text-primary-dark transition-all shrink-0",
      submitBtn: "w-full py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
    },
    modal: {
      label: "block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2",
      input: "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all",
      searchIcon: "absolute right-3 top-3.5 text-slate-400 text-base material-symbols-outlined",
      resultsPanel: "absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto text-slate-800 dark:text-white",
      resultRow: "p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors cursor-pointer text-right flex flex-col gap-0.5",
      resultName: "text-xs font-bold text-slate-900 dark:text-white",
      resultSub: "text-[10px] text-slate-500 dark:text-slate-400",
      infoText: "text-xs text-slate-500 dark:text-slate-400 py-2.5 px-4 text-right",
      selectionBanner: "p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-primary dark:text-primary-light flex items-center justify-between gap-3 text-right mb-4",
      selectionLabel: "text-xs font-bold",
      selectionSub: "text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5",
      clearBtn: "p-1.5 hover:bg-primary/10 rounded-lg text-primary hover:text-primary-dark transition-all shrink-0",
      submitBtn: "w-full py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    }
  }[variant];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selected Banner */}
      {selectedUser && (
        <div className={classes.selectionBanner}>
          <div className="min-w-0 flex-1">
            <span className={classes.selectionLabel}>
              تم اختيار: {selectedUser.fullName}
            </span>
            <span className={classes.selectionSub}>
              {[selectedUser.email, selectedUser.studentNumber || selectedUser.departmentName].filter(Boolean).join(" - ")}
            </span>
          </div>
          <button 
            type="button" 
            onClick={handleClearSelection}
            className={classes.clearBtn}
            title="إلغاء الاختيار"
          >
            <span className="material-symbols-outlined text-sm block">close</span>
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative" ref={resultsRef}>
        <label className={classes.label}>ابحث عن طالب</label>
        <div className="relative">
          <span className={classes.searchIcon}>search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowResults(true)}
            className={classes.input}
            placeholder="ابحث بالبريد الإلكتروني أو اسم المستخدم"
            disabled={isSubmitting || isLoading}
          />
        </div>

        {/* Results Panel */}
        {showResults && (
          <div className={classes.resultsPanel}>
            {isLoading ? (
              <div className={classes.infoText}>جاري البحث عن الطلاب...</div>
            ) : error ? (
              <div className={classes.infoText}>{error}</div>
            ) : !isQueryValid ? (
              <div className={classes.infoText}>اكتب حرفين على الأقل للبحث</div>
            ) : filteredUsers.length === 0 ? (
              <div className={classes.infoText}>لا توجد نتائج مطابقة</div>
            ) : (
              <ul>
                {filteredUsers.map((user) => {
                  const displaySub = [
                    user.email,
                    user.userName ? `@${user.userName}` : '',
                    user.studentNumber || user.departmentName
                  ].filter(Boolean).join(" - ");

                  return (
                    <li
                      key={`student-${user.id}`}
                      onClick={() => handleSelectUser(user)}
                      className={classes.resultRow}
                    >
                      <span className={classes.resultName}>{user.fullName}</span>
                      <span className={classes.resultSub}>{displaySub}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || isLoading || !selectedUser || !teamId}
        className={classes.submitBtn}
      >
        {isSubmitting ? 'جاري الإضافة...' : 'إضافة للفريق'}
      </button>
    </form>
  );
};

export default AddTeamMemberSearch;
