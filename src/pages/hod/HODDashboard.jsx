import React, { useState, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useProposals } from '../../hooks/useProposals';
import { useRequests } from '../../hooks/useRequests';
import useNotifications from '../../hooks/useNotifications';
import StatusBadge from '../../components/common/StatusBadge';
import GlobalLoader from '../../components/common/GlobalLoader';
import { formatNumber, formatDate } from '../../utils/formatNumber';

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

const HODDashboard = () => {
    const { data: projects, isLoading: projectsLoading } = useProjects();
    const { data: proposals, isLoading: proposalsLoading } = useProposals();
    const { data: requests, isLoading: requestsLoading } = useRequests();
    const { notifications, isLoading: notificationsLoading } = useNotifications();

    const isLoading = projectsLoading || proposalsLoading || requestsLoading || notificationsLoading;

    const stats = [
        { title: "إجمالي المشاريع", value: Array.isArray(projects) ? projects.length : 0, icon: "rocket_launch", color: "text-purple-600 bg-purple-600" },
        { title: "إجمالي المقترحات", value: Array.isArray(proposals) ? proposals.length : 0, icon: "description", color: "text-blue-600 bg-blue-600" },
        { title: "إجمالي الطلبات", value: Array.isArray(requests) ? requests.length : 0, icon: "list_alt", color: "text-amber-600 bg-amber-600" },
        { title: "الإشعارات", value: Array.isArray(notifications) ? notifications.length : 0, icon: "notifications", color: "text-emerald-600 bg-emerald-600" }
    ];

    if (isLoading) return <GlobalLoader inline message="جاري تحميل لوحة القيادة لرئيس القسم..." />;

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 text-right page-enter" dir="rtl">
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">لوحة القيادة لرئيس القسم</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">نظرة عامة على نشاطات القسم والمشاريع الحالية.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 stagger-children">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} delay={index * 50} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between flex-row-reverse">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">أحدث المقترحات</h3>
                        <p className="text-sm text-slate-500">آخر التحديثات</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-premium">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">المقترح</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Array.isArray(proposals) && proposals.slice(0, 5).map((proposal) => (
                                    <tr key={proposal.reportID || proposal.proposalID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{proposal.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={proposal.status} />
                                        </td>
                                    </tr>
                                ))}
                                {(!Array.isArray(proposals) || proposals.length === 0) && (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-10 text-center text-slate-400">لا توجد مقترحات مسجلة حالياً</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">أحدث التنبيهات</h3>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-premium flex flex-col gap-4">
                        {Array.isArray(notifications) && notifications.slice(0, 4).map((notif, idx) => (
                            <div key={idx} className="flex gap-3 flex-row-reverse text-right border-b border-slate-50 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-symbols-outlined text-sm">notifications</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{notif.message}</p>
                                    <p className="text-[10px] text-slate-500">{formatDate(notif.createdAt)}</p>
                                </div>
                            </div>
                        ))}
                        {(!Array.isArray(notifications) || notifications.length === 0) && (
                            <p className="text-center text-sm text-slate-400 py-4">لا توجد إشعارات حالياً</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
