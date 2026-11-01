import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import reportService from '../../services/reportService';
import useMyTeam from '../../hooks/useMyTeam';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:       { label: 'قيد المراجعة',       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    approved:      { label: 'مقبول',              cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rejected:      { label: 'مرفوض',              cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    draft:         { label: 'مسودة',              cls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
    submitted:     { label: 'تم التسليم',          cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
    reviewed:      { label: 'تمت المراجعة',        cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    needsrevision: { label: 'يحتاج تعديل',         cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  };
  const key = status ? status.toLowerCase() : 'pending';
  const { label, cls } = map[key] || map.pending;
  return <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

const getReportTypeLabel = (type) => {
  const map = {
    weekly: 'أسبوعي',
    final: 'نهائي',
    proposal: 'مقترح مشروع',
  };
  const key = type ? type.toLowerCase() : '';
  return map[key] || type || '—';
};

const ReportDetails = () => {
  const { id } = useParams();
  const { hasTeam, hasProject, isLoading: teamLoading } = useMyTeam();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasTeam || !hasProject) {
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        // Fetch all my reports and find by ReportID (backend field, not id)
        const data = await reportService.getMyReports();
        console.log('Reports for details:', data);
        const found = Array.isArray(data) ? data.find(r => String(r.reportID) === String(id)) : null;
        setReport(found || null);
      } catch (err) {
        setError(err.response?.data?.message || 'فشل تحميل تفاصيل التقرير');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, hasTeam, hasProject]);

  if (teamLoading || isLoading) return <Spinner />;

  if (!hasTeam || !hasProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <span className="material-symbols-outlined text-5xl text-amber-500">lock</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">صفحة التقارير مقفلة</h2>
        <p className="text-slate-500">الوصول للتقارير متاح فقط بعد تعيين مشروع لفريقك.</p>
        <Link to="/student/dashboard" className="text-primary font-bold text-sm hover:underline">← العودة للوحة التحكم</Link>
      </div>
    );
  }

  if (error) return (
    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm">{error}</div>
  );

  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
      <p className="text-slate-500">لم يتم العثور على التقرير</p>
      <Link to="/student/reports" className="text-primary font-bold text-sm hover:underline">← العودة للتقارير</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/student/reports" className="hover:text-primary">التقارير</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">تفاصيل التقرير</span>
      </nav>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{report.title || '—'}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {report.submissionDate ? new Date(report.submissionDate).toLocaleDateString('ar-SA') : '—'}
            </p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon="category" label="نوع التقرير" value={getReportTypeLabel(report.reportType)} />
            <InfoRow icon="calendar_today" label="تاريخ التسليم" value={report.submissionDate ? new Date(report.submissionDate).toLocaleDateString('ar-SA') : '—'} />
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">الوصف</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-break-word">{report.description || '—'}</p>
          </div>

          {/* Student Submitted File */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">ملف التقرير المرفق من الفريق</p>
            {report.filePath ? (
              <a
                href={report.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-all"
              >
                <span className="material-symbols-outlined text-base">link</span>
                فتح ملف الفريق
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            ) : (
              <p className="text-sm text-slate-400 font-medium">لا يوجد ملف مرفق من الفريق</p>
            )}
          </div>

          {/* Supervisor Feedback & Attached File */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">تعليقات وملاحظات المشرف</p>
            <div className={`border rounded-xl p-5 space-y-4 ${
              report.status?.toLowerCase() === 'approved'
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                : report.status?.toLowerCase() === 'rejected'
                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
            }`}>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">الملاحظات المكتوبة</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-break-word">
                  {report.feedback || 'لا توجد تعليقات مكتوبة بعد'}
                </p>
              </div>

              {(report.supervisorFileUrl || report.SupervisorFileUrl) && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">ملف المشرف المرفق</p>
                  <a
                    href={report.supervisorFileUrl || report.SupervisorFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-primary/30 rounded-lg text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">attachment</span>
                    فتح ملف المشرف المرفق
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Link to="/student/reports" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-base">arrow_forward</span>
        العودة إلى التقارير
      </Link>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
      <span className="material-symbols-outlined text-base text-slate-400">{icon}</span>
      {value}
    </p>
  </div>
);

export default ReportDetails;
