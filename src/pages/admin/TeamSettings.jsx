import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import settingsService from '../../services/settingsService';
import toast from 'react-hot-toast';

const TeamSettings = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // Load department team limits
  const fetchLimits = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getDepartmentTeamLimits();
      // Map to keep track of edited state locally
      setDepartments(
        data.map((dept) => ({
          ...dept,
          localMin: dept.minTeamMembers,
          localMax: dept.maxTeamMembers,
          errors: { min: null, max: null }
        }))
      );
    } catch (error) {
      console.error('Failed to load limits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  // Handle local change in input
  const handleLimitChange = (deptId, field, value) => {
    setDepartments((prev) =>
      prev.map((dept) => {
        if (dept.departmentID !== deptId) return dept;

        const updated = { ...dept };
        if (field === 'min') {
          updated.localMin = value;
          updated.errors.min = null;
        } else {
          updated.localMax = value;
          updated.errors.max = null;
        }
        return updated;
      })
    );
  };

  // Validate and submit settings change
  const handleSave = async (dept) => {
    const minVal = parseInt(dept.localMin);
    const maxVal = parseInt(dept.localMax);

    // ── Frontend validations ──────────────────────────────────────────────
    if (isNaN(minVal) || isNaN(maxVal)) {
      toast.error('يرجى إدخال أرقام صحيحة');
      return;
    }

    if (minVal < 1) {
      toast.error('الحد الأدنى يجب أن يكون 1 أو أكثر');
      return;
    }

    if (maxVal < minVal) {
      toast.error('الحد الأقصى يجب أن يكون أكبر من أو يساوي الحد الأدنى');
      return;
    }

    if (maxVal > 20) {
      toast.error('الحد الأقصى لأعضاء الفريق كبير جدًا');
      return;
    }

    try {
      setSavingId(dept.departmentID);
      const payload = {
        MinTeamMembers: minVal,
        MaxTeamMembers: maxVal
      };

      await settingsService.updateDepartmentTeamLimits(dept.departmentID, payload);

      toast.success('تم حفظ إعدادات القسم بنجاح');
      
      // Update saved values in state so the UI stays synced
      setDepartments((prev) =>
        prev.map((d) =>
          d.departmentID === dept.departmentID
            ? { ...d, minTeamMembers: minVal, maxTeamMembers: maxVal }
            : d
        )
      );
    } catch (error) {
      console.error('Failed to save limits:', error);
      toast.error('فشل حفظ إعدادات القسم');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-right" dir="rtl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link className="hover:text-primary transition-colors" to="/admin/dashboard">
          الرئيسية
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <span className="text-slate-900 dark:text-white font-medium">إعدادات الفرق</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            إعدادات الفرق
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            إدارة الحدود الدنيا والقصوى لعدد أعضاء فريق التخرج لكل قسم أكاديمي.
          </p>
        </div>

        {/* Settings Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              حدود أعضاء الفريق حسب القسم
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              يتم تطبيق هذه الإعدادات تلقائياً عند إضافة الطلاب إلى الفرق أو تقديم مقترح المشروع.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">جاري تحميل إعدادات الأقسام...</p>
            </div>
          ) : departments.length === 0 ? (
            <div className="py-24 text-center">
              <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                  account_balance
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">لا توجد أقسام متاحة</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                تأكد من وجود أقسام مسجلة في كليتك لتتمكن من ضبط إعداداتها.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      القسم
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      الكلية
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-44">
                      الحد الأدنى للأعضاء
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-44">
                      الحد الأقصى للأعضاء
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-32">
                      الإجراء
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {departments.map((dept) => {
                    const isChanged =
                      dept.localMin !== dept.minTeamMembers || dept.localMax !== dept.maxTeamMembers;

                    return (
                      <tr
                        key={dept.departmentID}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white">
                          {dept.departmentName}
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                          {dept.collegeName}
                        </td>
                        <td className="px-6 py-5">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={dept.localMin}
                            onChange={(e) =>
                              handleLimitChange(dept.departmentID, 'min', e.target.value)
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </td>
                        <td className="px-6 py-5">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={dept.localMax}
                            onChange={(e) =>
                              handleLimitChange(dept.departmentID, 'max', e.target.value)
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          />
                        </td>
                        <td className="px-6 py-5">
                          <button
                            disabled={savingId === dept.departmentID || !isChanged}
                            onClick={() => handleSave(dept)}
                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                              isChanged
                                ? 'bg-primary text-white shadow-primary/10 hover:bg-primary/95 hover:shadow-primary/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed'
                            }`}
                          >
                            {savingId === dept.departmentID ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-sm">save</span>
                                <span>حفظ</span>
                              </>
                            )}
                          </button>
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
    </div>
  );
};

export default TeamSettings;
