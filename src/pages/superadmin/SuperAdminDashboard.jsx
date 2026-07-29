import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import superAdminService from '../../services/superAdminService';
import StatusBadge from '../../components/common/StatusBadge';
import GlobalLoader from '../../components/common/GlobalLoader';
import { formatNumber, toWesternDigits } from '../../utils/formatNumber';

// ── Animated Counter Hook ──────────────────────────────────────────────────────
function useAnimatedCounter(target, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, color, description, delay = 0 }) => {
  const animValue = useAnimatedCounter(value);
  return (
    <div
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-premium card-hover flex flex-col gap-1 relative overflow-hidden group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background icon watermark */}
      <div className="absolute top-0 left-0 p-4 opacity-[0.04] group-hover:scale-110 transition-transform duration-500">
        <span className="material-symbols-outlined text-8xl">{icon}</span>
      </div>

      {/* Gradient top accent */}
      <div className={`absolute top-0 right-0 w-1 h-full rounded-l-full ${color.split(' ')[1]}`} />

      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${color.split(' ')[1]}/15 border ${color.split(' ')[1]}/20`}>
          <span className={`material-symbols-outlined text-[22px] ${color.split(' ')[0]}`}
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      </div>
      <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums stat-value">
        {formatNumber(animValue)}
      </p>
      {description && <p className="text-[11px] text-slate-400 mt-1 font-medium">{description}</p>}
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingActions, setPendingActions] = useState(null);
  const [topProjects, setTopProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [statsData, pendingData, projectsData, activityData, healthData] = await Promise.all([
          superAdminService.getDashboardStats(),
          superAdminService.getPendingActions(),
          superAdminService.getTopProjects(5),
          superAdminService.getActivityFeed(6),
          superAdminService.getSystemHealth(),
        ]);
        if (statsData.success) setStats(statsData.data);
        if (pendingData.success) setPendingActions(pendingData.data);
        if (projectsData.success) setTopProjects(projectsData.data);
        if (activityData.success) {
          const sorted = (activityData.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setActivities(sorted);
        }
        if (healthData.success) setSystemHealth(healthData.data);
      } catch (err) {
        setError('فشل في تحميل بيانات لوحة القيادة العليا. يرجى المحاولة مرة أخرى.');
        console.error('Error fetching super admin dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) return <GlobalLoader inline message="جاري تحميل لوحة القيادة..." />;

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">حدث خطأ ما</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'إجمالي الكليات',      value: stats?.totalColleges || 0,         icon: 'domain',            color: 'text-blue-600 bg-blue-600',    description: 'كليات مسجلة بالنظام' },
    { title: 'إجمالي الأقسام',      value: stats?.totalDepartments || 0,      icon: 'account_balance',   color: 'text-indigo-600 bg-indigo-600', description: 'أقسام أكاديمية مفعلة' },
    { title: 'المشاريع الجارية',    value: stats?.totalProjects || 0,         icon: 'rocket_launch',     color: 'text-purple-600 bg-purple-600', description: 'مشاريع قيد العمل' },
    { title: 'المشاريع المؤرشفة',   value: stats?.archivedProjects || 0,      icon: 'archive',           color: 'text-emerald-600 bg-emerald-600', description: 'مشاريع ناجحة ومؤرشفة' },
    { title: 'الطلاب النشطون',      value: stats?.totalActiveStudents || 0,   icon: 'school',            color: 'text-cyan-600 bg-cyan-600',     description: 'طلاب مسجلون نشطون' },
    { title: 'المشرفون النشطون',    value: stats?.totalActiveSupervisors || 0, icon: 'supervisor_account', color: 'text-amber-600 bg-amber-600',  description: 'أعضاء هيئة تدريس' },
    { title: 'طلبات معلقة',         value: stats?.pendingRequests || 0,       icon: 'pending_actions',   color: 'text-red-600 bg-red-600',       description: 'تنتظر المراجعة' },
    { title: 'إجمالي المستخدمين',   value: stats?.totalUsers || 0,            icon: 'group',             color: 'text-slate-600 bg-slate-600',   description: 'جميع الحسابات النشطة' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            لوحة القيادة التنفيذية العليا
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            نظرة عامة شاملة على النظام، الكليات، الأداء والنشاطات الجارية.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/superadmin/analytics"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition-all text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-lg">monitoring</span>
            التحليلات المتقدمة
          </Link>
          <Link
            to="/superadmin/admins"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            إضافة مدير كلية
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 stagger-children">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} delay={index * 50} />
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-premium p-6 flex flex-col animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">إجراءات معلقة</h3>
              <p className="text-[11px] text-slate-400">ملخص العمليات المتبقية</p>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {[
              { label: 'طلبات تغيير المشرفين', value: pendingActions?.pendingChangeSupervisorRequests || 0, color: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400' },
              { label: 'طلبات تعديل المشاريع', value: pendingActions?.pendingChangeProjectRequests || 0, color: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400' },
              { label: 'مقترحات تنتظر الموافقة', value: pendingActions?.pendingProposals || 0, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400' },
              { label: 'تقارير تنتظر التقييم', value: pendingActions?.pendingReports || 0, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                <span className={`px-2.5 py-0.5 font-black rounded-lg text-sm tabular-nums ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-premium p-6 flex flex-col animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">صحة ونشاط المستخدمين</h3>
              <p className="text-[11px] text-slate-400">مراقبة الحسابات وتفاعلها</p>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            {[
              { label: 'الطلاب',        active: systemHealth?.activeStudents || 0,    inactive: systemHealth?.inactiveStudents || 0,    color: 'bg-cyan-500' },
              { label: 'المشرفون',      active: systemHealth?.activeSupervisors || 0, inactive: systemHealth?.inactiveSupervisors || 0, color: 'bg-amber-500' },
              { label: 'رؤساء الأقسام', active: systemHealth?.activeHODs || 0,        inactive: systemHealth?.inactiveHODs || 0,        color: 'bg-emerald-500' },
              { label: 'مدراء الكليات', active: systemHealth?.activeAdmins || 0,      inactive: systemHealth?.inactiveAdmins || 0,      color: 'bg-blue-500' },
            ].map((role, idx) => {
              const total = role.active + role.inactive;
              const pct = total > 0 ? Math.round((role.active / total) * 100) : 100;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>{role.label} ({role.active} نشط / {role.inactive} معطل)</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`${role.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-premium p-6 flex flex-col animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">أحدث النشاطات</h3>
                <p className="text-[11px] text-slate-400">آخر الإجراءات والأحداث</p>
              </div>
            </div>
            <Link to="/superadmin/activity" className="text-xs text-primary font-bold hover:underline">عرض الكل</Link>
          </div>
          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[260px]">
            {activities?.map((activity, idx) => (
              <div key={idx} className="flex gap-3 text-xs leading-normal items-start">
                <div className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-sm">
                    {activity.eventType === 'project_archived' ? 'archive' : activity.eventType === 'notification' ? 'notifications' : 'person'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">{activity.userName}</strong>: {activity.description}
                  </p>
                  {activity.relatedEntity && <p className="text-[10px] text-slate-400 mt-0.5">{activity.relatedEntity}</p>}
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {toWesternDigits(new Date(activity.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }))}
                </span>
              </div>
            ))}
            {(!activities || activities.length === 0) && (
              <div className="text-center py-8 text-slate-400 text-sm">لا توجد أنشطة مسجلة حالياً</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-premium animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>grade</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">المشاريع ذات التقييم الأعلى</h3>
              <p className="text-[11px] text-slate-400">أعلى 5 مشاريع تم أرشفتها وتقييمها</p>
            </div>
          </div>
          <Link to="/superadmin/archived-projects" className="text-xs text-primary font-bold hover:underline">تصفح الأرشيف</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
                <th className="px-6 py-4">صورة المشروع</th>
                <th className="px-6 py-4">عنوان المشروع</th>
                <th className="px-6 py-4">القسم والكلية</th>
                <th className="px-6 py-4">سنة الأرشفة</th>
                <th className="px-6 py-4">درجة التقييم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {topProjects?.map((project) => (
                <tr key={project.archivedProjectID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="size-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {project.projectImagePath ? (
                        <img src={getFileUrl(project.projectImagePath)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600">
                          <span className="material-symbols-outlined text-sm">image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{project.projectTitle}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{project.departmentName}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 tabular-nums">{project.year}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-black bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/30">
                      {project.evaluationScore} / 100
                    </span>
                  </td>
                </tr>
              ))}
              {topProjects.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">لا توجد مشاريع مؤرشفة حتى الآن</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
