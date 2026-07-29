import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdminService';
import { translateRole } from '../../utils/arabicLocalization';

const GlobalUsersOverview = () => {
  const [users, setUsers] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and query filters
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStaticData = async () => {
    try {
      const [collegesRes, deptsRes] = await Promise.all([
        superAdminService.getCollegeStats(),
        superAdminService.getDepartmentStats()
      ]);
      if (collegesRes.success) setColleges(collegesRes.data);
      if (deptsRes.success) setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Error loading colleges/depts lists:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        pageNumber: page,
        pageSize: pageSize,
        role: roleFilter || undefined,
        isActive: activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined,
        collegeId: collegeFilter ? parseInt(collegeFilter) : undefined,
        departmentId: deptFilter ? parseInt(deptFilter) : undefined
      };

      const res = await superAdminService.getGlobalUsers(params);
      if (res.success) {
        setUsers(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      } else {
        setError(res.message || 'فشل في تحميل المستخدمين');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء تحميل سجلات المستخدمين.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaticData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, activeFilter, collegeFilter, deptFilter, page]);

  const getRoleLabel = (role) => {
    return translateRole(role);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Student': return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400';
      case 'Supervisor': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
      case 'HeadOfDepartment': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Admin': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">إدارة المستخدمين العموميين</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">عرض وتصفية وبحث شامل في كافة الحسابات المفعلة بالنظام (طلاب، مشرفين، رؤساء أقسام، ومدراء).</p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">دور المستخدم</label>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm outline-none"
          >
            <option value="">كل الأدوار</option>
            <option value="Student">طالب (Student)</option>
            <option value="Supervisor">مشرف (Supervisor)</option>
            <option value="HeadOfDepartment">رئيس قسم (Head of Department)</option>
            <option value="Admin">مدير كلية (College Admin)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">الحالة</label>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm outline-none"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">معطل</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">الكلية</label>
          <select
            value={collegeFilter}
            onChange={(e) => { setCollegeFilter(e.target.value); setPage(1); setDeptFilter(''); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm outline-none"
          >
            <option value="">كل الكليات</option>
            {colleges?.map(c => (
              <option key={c.collegeID} value={c.collegeID}>{c.collegeName}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">القسم الأكاديمي</label>
          <select
            value={deptFilter}
            disabled={!collegeFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-transparent rounded-lg text-sm outline-none disabled:opacity-50"
          >
            <option value="">كل الأقسام</option>
            {departments && departments
              .filter(d => !collegeFilter || d.collegeName === colleges?.find(c => c.collegeID === parseInt(collegeFilter))?.collegeName)
              .map(d => (
                <option key={d.departmentID} value={d.departmentID}>{d.departmentName}</option>
              ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-red-500">
          <span className="material-symbols-outlined text-6xl">error</span>
          <p className="mt-2 font-bold">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
                  <th className="px-6 py-4">اسم المستخدم</th>
                  <th className="px-6 py-4">البريد الإلكتروني</th>
                  <th className="px-6 py-4">دور الحساب</th>
                  <th className="px-6 py-4">الكلية</th>
                  <th className="px-6 py-4">القسم</th>
                  <th className="px-6 py-4">تاريخ التسجيل</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {users?.map((user) => (
                  <tr key={user.userID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{user.fullName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{user.collegeName || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{user.departmentName || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 tabular-nums">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      }`}>
                        {user.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-400">لا توجد حسابات مطابقة للفلاتر المعينة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">إجمالي السجلات: {totalCount} مستخدم</span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  السابق
                </button>
                <span className="px-3 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalUsersOverview;
