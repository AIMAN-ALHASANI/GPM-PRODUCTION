import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdminService';
import structureService from '../../services/structureService';
import toast from 'react-hot-toast';
import { formatNumber, toWesternDigits } from '../../utils/formatNumber';

const CollegesManagement = () => {
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('colleges'); // 'colleges' or 'departments'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form states
  const [collegeName, setCollegeName] = useState('');
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [editingCollege, setEditingCollege] = useState(null);
  const [detailsCollege, setDetailsCollege] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [collegesRes, deptsRes, unisRes] = await Promise.all([
        superAdminService.getCollegeStats(),
        superAdminService.getDepartmentStats(),
        structureService.getUniversities()
      ]);

      if (collegesRes.success) setColleges(collegesRes.data);
      if (deptsRes.success) setDepartments(deptsRes.data);
      if (unisRes && unisRes.length > 0) {
        setUniversities(unisRes);
        setSelectedUniversityId(unisRes[0].universityID);
      } else {
        // Fallback default ID if no universities retrieved
        setSelectedUniversityId('1');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل بيانات الكليات والأقسام');
      console.error('Error loading colleges/depts data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!collegeName.trim()) {
      toast.error('يرجى إدخال اسم الكلية');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        collegeName: collegeName.trim(),
        universityID: parseInt(selectedUniversityId)
      };

      const res = await structureService.createCollege(data);
      toast.success('تم إضافة الكلية بنجاح');
      setIsAddModalOpen(false);
      setCollegeName('');
      // Refresh list
      await fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'فشل إضافة الكلية';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCollege = async (e) => {
    e.preventDefault();
    if (!collegeName.trim()) {
      toast.error('يرجى إدخال اسم الكلية');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        collegeName: collegeName.trim(),
        universityID: editingCollege.universityID || parseInt(selectedUniversityId)
      };

      await structureService.updateCollege(editingCollege.collegeID || editingCollege.collegeID, data);
      toast.success('تم تعديل اسم الكلية بنجاح');
      setIsEditModalOpen(false);
      setEditingCollege(null);
      setCollegeName('');
      // Refresh list
      await fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'فشل تعديل الكلية';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (college) => {
    setEditingCollege(college);
    setCollegeName(college.collegeName);
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (college) => {
    setDetailsCollege(college);
    setIsDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">خطأ في التحميل</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-primary text-white rounded-xl">إعادة المحاولة</button>
      </div>
    );
  }

  // Calculate high-level KPIs
  const totalColleges = colleges?.length || 0;
  const totalDepts = departments?.length || 0;
  const totalStudentsCount = colleges?.reduce((acc, c) => acc + (c.studentCount || 0), 0) || 0;
  const totalSupervisorsCount = colleges?.reduce((acc, c) => acc + (c.supervisorCount || 0), 0) || 0;
  const overallAvgScore = colleges?.length 
    ? (colleges.reduce((acc, c) => acc + (c.averageEvaluationScore || 0), 0) / colleges.length).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 rtl page-enter" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">الكليات والأقسام الأكاديمية</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">إدارة الكليات بالمنصة ومتابعة أداء الأقسام العلمية ومشاريع التخرج بالتفصيل.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setCollegeName('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all text-sm font-bold shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">domain_add</span>
            إضافة كلية جديدة
          </button>
        </div>
      </div>

      {/* KPI Cards Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-4 opacity-5 text-primary">
            <span className="material-symbols-outlined text-6xl">domain</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase">إجمالي الكليات</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{formatNumber(totalColleges)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-4 opacity-5 text-indigo-500">
            <span className="material-symbols-outlined text-6xl">account_balance</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase">إجمالي الأقسام</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{formatNumber(totalDepts)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-4 opacity-5 text-cyan-500">
            <span className="material-symbols-outlined text-6xl">school</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase">إجمالي الطلاب</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{formatNumber(totalStudentsCount)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-4 opacity-5 text-amber-500">
            <span className="material-symbols-outlined text-6xl">supervisor_account</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase">المشرفين الأكاديميين</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{formatNumber(totalSupervisorsCount)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-4 opacity-5 text-emerald-500">
            <span className="material-symbols-outlined text-6xl">grade</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase">متوسط التقييم العام</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{overallAvgScore} <span className="text-sm font-medium text-slate-400">/ 100</span></p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('colleges')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'colleges'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          الكليات المسجلة ({totalColleges})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'departments'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          الأقسام وتصنيف الأداء ({totalDepts})
        </button>
      </div>

      {activeTab === 'colleges' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges?.map((c) => (
            <div key={c.collegeID} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group duration-300 relative">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-primary to-blue-500"></div>
              
              {/* College Card Header */}
              <div className="p-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <span className="material-symbols-outlined text-[24px]">domain</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {c.collegeName}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-850/20 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">الأقسام العلمية</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums">{c.departmentCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">متوسط تقييم التخرج</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">{c.averageEvaluationScore} / 100</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">الطلاب النشطين</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums">{c.studentCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">أعضاء هيئة الإشراف</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums">{c.supervisorCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">المشاريع الجارية</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{c.projectCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">المشاريع المؤرشفة</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{c.archivedProjectCount}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openDetailsModal(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  تفاصيل
                </button>
                <button
                  onClick={() => openEditModal(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  تعديل الاسم
                </button>
              </div>
            </div>
          ))}
          {(!colleges || colleges.length === 0) && (
            <div className="col-span-full text-center py-20 text-slate-400">لا توجد كليات مسجلة بالنظام</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.map((d) => (
            <div key={d.departmentID} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-all duration-300 relative group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                  {d.collegeName}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{d.departmentName}</h3>
              
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>الطلاب المسجلين:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{d.studentCount} طالب</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>المشرفين الأكاديميين:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{d.supervisorCount} عضو</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>المشاريع النشطة / المؤرشفة:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{d.projectCount} / {d.archivedProjectCount}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>أداء التقييم للقسم:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-bold tabular-nums">
                    {d.averageEvaluationScore} / 100
                  </span>
                </div>
              </div>
            </div>
          ))}
          {(!departments || departments.length === 0) && (
            <div className="col-span-full text-center py-20 text-slate-400">لا توجد أقسام مسجلة بالنظام</div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* ADD COLLEGE MODAL */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">إضافة كلية جديدة</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddCollege} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الكلية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كلية علوم الحاسب والمعلومات"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              {universities.length > 1 && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الجامعة التابعة لها</label>
                  <select
                    value={selectedUniversityId}
                    onChange={(e) => setSelectedUniversityId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"
                  >
                    {universities.map(u => (
                      <option key={u.universityID} value={u.universityID}>{u.universityName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin" />}
                  <span>حفظ البيانات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* EDIT COLLEGE MODAL */}
      {/* ==================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">تعديل اسم الكلية</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleEditCollege} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الكلية الجديد</label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin" />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW DETAILS MODAL */}
      {/* ==================================================== */}
      {isDetailsModalOpen && detailsCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">domain</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">تفاصيل {detailsCollege.collegeName}</h3>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-450 block mb-1">الأقسام العلمية</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{detailsCollege.departmentCount}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-450 block mb-1">متوسط تقييم المشاريع</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{detailsCollege.averageEvaluationScore} / 100</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-450 block mb-1">الطلاب النشطين</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{detailsCollege.studentCount}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-450 block mb-1">المشرفين الأكاديميين</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{detailsCollege.supervisorCount}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-450 block mb-1">المشاريع الجارية</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{detailsCollege.projectCount}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-450 block mb-1">المشاريع المؤرشفة</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{detailsCollege.archivedProjectCount}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white border-r-4 border-primary pr-2">الأقسام العلمية التابعة</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {departments?.filter(d => d.collegeName === detailsCollege.collegeName).map((d) => (
                    <div key={d.departmentID} className="flex justify-between items-center p-3 bg-slate-50/50 dark:bg-slate-850/30 rounded-lg text-sm border border-slate-100 dark:border-slate-800/50">
                      <span className="font-bold text-slate-850 dark:text-slate-100">{d.departmentName}</span>
                      <span className="text-xs text-slate-450 tabular-nums">{d.studentCount} طالباً • {d.supervisorCount} مشرفاً</span>
                    </div>
                  ))}
                  {departments?.filter(d => d.collegeName === detailsCollege.collegeName).length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-4">لا توجد أقسام مسجلة لهذه الكلية حالياً</div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegesManagement;
