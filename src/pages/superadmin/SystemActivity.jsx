import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdminService';
import { toWesternDigits } from '../../utils/formatNumber';

const SystemActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await superAdminService.getActivityFeed(50);
        if (res.success) {
          const sorted = (res.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setActivities(sorted);
        } else {
          setError(res.message || 'فشل في تحميل نشاط النظام');
        }
      } catch (err) {
        setError('فشل في الاتصال بالخادم لتحميل سجلات النشاط');
        console.error('Error fetching activity:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
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
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">خطأ في التحميل</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
      </div>
    );
  }

  const getEventBadge = (type) => {
    switch (type) {
      case 'project_archived':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
      case 'project_approved':
        return 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900/30';
      case 'student_registered':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30';
      case 'supervisor_created':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30';
      case 'hod_created':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30';
      case 'admin_created':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
      case 'college_created':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/30';
      case 'department_created':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/30';
      case 'supervisor_assigned':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200 dark:border-violet-900/30';
      case 'team_created':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-teal-200 dark:border-teal-900/30';
      case 'proposal_submitted':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/30';
      case 'report_submitted':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/30';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400 border-slate-200 dark:border-slate-900/30';
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'project_archived': return 'أرشفة مشروع نهائي';
      case 'project_approved': return 'اعتماد مشروع تخرج';
      case 'student_registered': return 'تسجيل طالب جديد';
      case 'supervisor_created': return 'إنشاء حساب مشرف';
      case 'hod_created': return 'إنشاء رئيس قسم';
      case 'admin_created': return 'تعيين مدير كلية';
      case 'college_created': return 'إنشاء كلية جديدة';
      case 'department_created': return 'إنشاء قسم جديد';
      case 'supervisor_assigned': return 'تعيين مشرف علمي';
      case 'team_created': return 'تأسيس فريق تخرج';
      case 'proposal_submitted': return 'تقديم مقترح مشروع';
      case 'report_submitted': return 'تسليم تقرير متابعة';
      default: return 'حدث نظام';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'project_archived': return 'archive';
      case 'project_approved': return 'verified';
      case 'student_registered': return 'person_add';
      case 'supervisor_created': return 'person_add';
      case 'hod_created': return 'person_add';
      case 'admin_created': return 'admin_panel_settings';
      case 'college_created': return 'domain';
      case 'department_created': return 'account_balance';
      case 'supervisor_assigned': return 'assignment_ind';
      case 'team_created': return 'group_add';
      case 'proposal_submitted': return 'description';
      case 'report_submitted': return 'feed';
      default: return 'event_note';
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-10 rtl text-right" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">سجل نشاط الأحداث الفعلي</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          مخطط زمني تفاعلي يوضح العمليات الحقيقية الجارية بالنظام كأرشفة المشاريع، تسجيل المستخدمين، تأسيس الفرق والاعتمادات.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8">
        <div className="relative border-r-2 border-slate-100 dark:border-slate-800/80 mr-6 space-y-8 py-4">
          {activities?.map((activity, idx) => (
            <div key={idx} className="relative flex gap-6 items-start group">
              
              {/* Timeline dot with icon support */}
              <div className="absolute -right-[43px] top-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 size-9 rounded-full flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[18px]">{getEventIcon(activity.eventType)}</span>
              </div>
              
              <div className="flex-1 mr-4">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className={`px-3 py-0.5 text-[10px] font-black rounded-lg border uppercase tracking-wider ${getEventBadge(activity.eventType)}`}>
                    {getEventLabel(activity.eventType)}
                  </span>
                  <span className="text-slate-900 dark:text-white font-black text-sm">
                    {activity.userName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold tabular-nums mr-auto">
                    {toWesternDigits(new Date(activity.timestamp).toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' }))}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed font-semibold">
                  {activity.description}
                </p>
                {activity.relatedEntity && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/30 text-slate-500 rounded-lg text-xs border border-slate-100 dark:border-slate-800/50">
                    <span className="material-symbols-outlined text-sm">link</span>
                    <span className="font-medium">{activity.relatedEntity}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!activities || activities.length === 0) && (
            <div className="text-center py-20 text-slate-450 font-bold">لا توجد سجلات أنشطة مسجلة في النظام حالياً</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemActivity;
