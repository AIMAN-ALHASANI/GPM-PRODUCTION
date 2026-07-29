import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import superAdminService from '../../services/superAdminService';

const SuperAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await superAdminService.getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        } else {
          setError(res.message || 'فشل في تحميل التحليلات');
        }
      } catch (err) {
        setError('فشل في الاتصال بالنظام لطلب الإحصائيات');
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">خطأ في التحليلات</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
      </div>
    );
  }

  // Map user distribution for Recharts Pie
  const userDistData = analytics?.userDistribution ? [
    { name: 'الطلاب', value: analytics.userDistribution.students, color: '#06b6d4' },
    { name: 'المشرفين', value: analytics.userDistribution.supervisors, color: '#f59e0b' },
    { name: 'رؤساء الأقسام', value: analytics.userDistribution.hoDs, color: '#10b981' },
    { name: 'المدراء', value: analytics.userDistribution.admins, color: '#3b82f6' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">التحليلات المتقدمة</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">تحليلات رسومية شاملة لأداء الكليات والأقسام، وتوزيع الحسابات وحركة الأرشفة.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Projects By College (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">مشاريع التخرج حسب الكلية</h3>
          <div className="h-80 w-full flex-1">
            {analytics?.projectsByCollege?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.projectsByCollege} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ textAlign: 'right' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="عدد المشاريع" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات متوفرة</div>
            )}
          </div>
        </div>

        {/* Projects By Department (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">مشاريع التخرج حسب القسم الأكاديمي</h3>
          <div className="h-80 w-full flex-1">
            {analytics?.projectsByDepartment?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.projectsByDepartment} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(168, 85, 247, 0.05)' }} contentStyle={{ textAlign: 'right' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} name="عدد المشاريع" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات متوفرة</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Distribution (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">توزيع الحسابات بالنظام</h3>
          <div className="h-64 w-full relative flex items-center justify-center">
            {userDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {userDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ textAlign: 'right' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">لا توجد بيانات</div>
            )}
          </div>
          <div className="mt-4 space-y-2.5">
            {userDistData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-bold tabular-nums">{item.value} حساب</span>
              </div>
            ))}
          </div>
        </div>

        {/* Archived Projects over Years (Area Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">المشاريع المؤرشفة سنوياً</h3>
          <div className="h-80 w-full flex-1">
            {analytics?.archivedByYear?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.archivedByYear} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArchived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ textAlign: 'right' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorArchived)" strokeWidth={2.5} name="المشاريع المؤرشفة" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات متوفرة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
