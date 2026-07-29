import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisorTeams, usePendingReportsCount } from '../../hooks/useSupervisor';
import useNotifications from '../../hooks/useNotifications';

const StatCard = ({ title, icon, value, colorClass }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-primary">
      <span className="material-symbols-outlined text-7xl">{icon}</span>
    </div>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
    </div>
    <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{value}</p>
  </div>
);

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { notifications, isLoading: notificationsLoading } = useNotifications({ fetchAll: false });
  const { data: teams, isLoading: teamsLoading, isError: teamsError } = useSupervisorTeams();
  const { data: pendingReportsData, isLoading: pendingReportsLoading } = usePendingReportsCount();
  const pendingReportsCount = pendingReportsData?.count ?? 0;

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">لوحة التحكم</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">مرحباً بك في لوحة تحكم المشرف.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
            title="إجمالي التنبيهات" 
            icon="notifications" 
            value={Array.isArray(notifications) ? notifications.length : 0} 
            colorClass="text-primary bg-primary" 
        />
        <StatCard 
            title="عدد الفرق" 
            icon="group" 
            value={Array.isArray(teams) ? teams.length : 0} 
            colorClass="text-blue-600 bg-blue-600" 
        />
        <StatCard 
            title="التقارير المعلقة" 
            icon="rate_review" 
            value={pendingReportsLoading ? '...' : pendingReportsCount} 
            colorClass="text-amber-600 bg-amber-600" 
        />
      </div>

      <div className="space-y-6 mb-12">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">فرقي</h3>
        {teamsLoading ? (
            <div className="p-10 text-center text-slate-400 animate-pulse font-bold">جاري تحميل الفرق...</div>
        ) : teamsError ? (
            <div className="p-10 text-center text-red-500 font-bold">تعذر تحميل الفرق</div>
        ) : (Array.isArray(teams) && teams.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                    <div key={team.teamID} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{team.teamName}</h4>
                                <p className="text-sm text-slate-500 mt-1 font-bold">{team.projectTitle || 'لم يتم تحديد مشروع'}</p>
                            </div>
                            
                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800 pt-4">
                                    <span>الأعضاء: {team.memberCount}</span>
                                    <span>ID: {team.teamID}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => navigate(`/supervisor/reports?teamId=${team.teamID}`)}
                                        className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                                    >
                                        عرض التقارير
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/supervisor/meetings?teamId=${team.teamID}`)}
                                        className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                                    >
                                        عرض الاجتماعات
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-900 p-20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">group_off</span>
                <p className="text-slate-500 font-bold text-lg">لا توجد فرق مرتبطة بحسابك حاليًا</p>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">أحدث التنبيهات</h3>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            {notificationsLoading ? (
              <p className="text-center text-slate-400 py-4 animate-pulse font-bold">جاري تحميل الإشعارات...</p>
            ) : (Array.isArray(notifications) && notifications.length > 0) ? (
              notifications.slice(0, 5).map((notif, idx) => {
                const message = notif.message || notif.Message;
                const createdAt = notif.createdAt || notif.CreatedAt;
                return (
                  <div key={idx} className="flex gap-3 flex-row-reverse text-right border-b border-slate-50 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">notifications</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{message}</p>
                      <p className="text-[10px] text-slate-500">{createdAt ? new Date(createdAt).toLocaleDateString('ar-EG') : '---'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-sm text-slate-400 py-8">لا توجد إشعارات حالياً</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">إجراءات سريعة</h3>
          <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:scale-110 transition-transform">event_note</span>
            <h4 className="text-xl font-black mb-2">إدارة الاجتماعات</h4>
            <p className="text-primary-foreground/80 text-sm mb-6 leading-relaxed">قم بجدولة ومتابعة اجتماعاتك مع الفرق المختلفة.</p>
            <button onClick={() => navigate('/supervisor/meetings')} className="inline-flex items-center gap-2 bg-white text-primary px-6 py-2.5 rounded-xl text-[10px] font-black shadow-sm hover:bg-slate-50 transition-all">
              انتقال للاجتماعات
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
