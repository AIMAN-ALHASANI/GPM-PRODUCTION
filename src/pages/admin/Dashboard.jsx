import React, { useState, useEffect } from 'react';
import { useCollegeStudents, useCollegeSupervisors, useCollegeHODs } from '../../hooks/useUsers';
import { useCollegeProjects } from '../../hooks/useProjects';
import { dashboardService } from '../../services/dashboardService';
import StatusBadge from '../../components/common/StatusBadge';
import GlobalLoader from '../../components/common/GlobalLoader';
import { formatNumber } from '../../utils/formatNumber';

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
const StatCard = ({ title, value, icon, color, delay = 0 }) => {
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
    </div>
  );
};

const Dashboard = () => {
    const { data: studentsRes } = useCollegeStudents();
    const { data: supervisorsRes } = useCollegeSupervisors();
    const { data: hodsRes } = useCollegeHODs();
    const { data: projectsRes } = useCollegeProjects(); // Used for the recent projects table
    const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || []);

    const [departmentsCount, setDepartmentsCount] = useState(0);
    const [projectsCount, setProjectsCount] = useState(0);
    const [teamsCount, setTeamsCount] = useState(0);
    const [archivedProjectsCount, setArchivedProjectsCount] = useState(0);
    const [isLoadingCards, setIsLoadingCards] = useState(true);
    const [cardsError, setCardsError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoadingCards(true);
                setCardsError(null);
                const [depts, projectsData, teams, archived] = await Promise.all([
                    dashboardService.getDepartments(),
                    dashboardService.getCollegeProjects(),
                    dashboardService.getCollegeTeams(),
                    dashboardService.getCollegeArchivedProjects()
                ]);
                setDepartmentsCount(depts.length);
                setProjectsCount(projectsData.length);
                setTeamsCount(teams.length);
                setArchivedProjectsCount(archived.length);
            } catch (err) {
                setCardsError('فشل في تحميل إحصائيات لوحة القيادة');
                // Real server error — UI already shows cardsError banner
            } finally {
                setIsLoadingCards(false);
            }
        };
        fetchDashboardData();
    }, []);

    const stats = [
        { title: "الطلاب", value: studentsRes?.data?.length || 0, icon: "school", color: "text-blue-600 bg-blue-600" },
        { title: "المشرفون", value: supervisorsRes?.data?.length || 0, icon: "supervisor_account", color: "text-indigo-600 bg-indigo-600" },
        { title: "الأقسام", value: departmentsCount, icon: "account_balance", color: "text-emerald-600 bg-emerald-600" },
        { title: "المشاريع", value: projectsCount, icon: "rocket_launch", color: "text-purple-600 bg-purple-600" },
        { title: "فرق العمل", value: teamsCount, icon: "groups", color: "text-amber-600 bg-amber-600" },
        { title: "الأرشيف", value: archivedProjectsCount, icon: "inventory_2", color: "text-slate-600 bg-slate-600" }
    ];

    if (isLoadingCards) return <GlobalLoader inline message="جاري تحميل لوحة القيادة للكلية..." />;

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 page-enter">
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">لوحة القيادة للكلية</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">نظرة عامة على نشاطات النظام والإحصائيات الحالية للكلية.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 stagger-children">
                {cardsError ? (
                    <div className="col-span-full flex justify-center py-10">
                        <p className="text-red-500 font-bold">{cardsError}</p>
                    </div>
                ) : (
                    stats.map((stat, index) => (
                        <StatCard key={index} {...stat} delay={index * 50} />
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">المشاريع الأكاديمية</h3>
                        <p className="text-sm text-slate-500">آخر التحديثات</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-premium">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">المشروع</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الفريق</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {projects.slice(0, 5).map((project) => (
                                    <tr key={project.projectID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{project.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{project.teamName || 'لم يحدد'}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={project.status} />
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400">لا توجد مشاريع مسجلة حالياً</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">توزيع المستخدمين</h3>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-premium flex flex-col h-full">
                        <div className="space-y-8 flex-1">
                            {[
                                { label: "الطلاب", count: studentsRes?.data?.length || 0, color: "bg-blue-600" },
                                { label: "المشرفون", count: supervisorsRes?.data?.length || 0, color: "bg-indigo-600" },
                                { label: "رؤساء الأقسام", count: hodsRes?.data?.length || 0, color: "bg-emerald-600" }
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                        <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatNumber(item.count)}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                        <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${(item.count / (studentsRes?.data?.length + supervisorsRes?.data?.length + hodsRes?.data?.length || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
