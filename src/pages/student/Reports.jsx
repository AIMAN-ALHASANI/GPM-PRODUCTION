import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useMyTeam from '../../hooks/useMyTeam';
import { useAuth } from '../../context/AuthContext';
import reportService from '../../services/reportService';
import NoTeamGate from '../../components/common/NoTeamGate';
import toast from 'react-hot-toast';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

/**
 * Backend returns raw Report entity with Status as ReportStatus enum string:
 * "Pending" | "Approved" | "Rejected" | "Draft" | "Submitted" | "Reviewed" | "NeedsRevision"
 */
const StatusBadge = ({ status }) => {
  const map = {
    pending:       { label: 'قيد المراجعة',       cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    approved:      { label: 'مقبول',              cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    rejected:      { label: 'مرفوض',              cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
    draft:         { label: 'مسودة',              cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
    submitted:     { label: 'تم التسليم',          cls: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400' },
    reviewed:      { label: 'تمت المراجعة',        cls: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
    needsrevision: { label: 'يحتاج تعديل',         cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  };
  const key = status ? status.toLowerCase() : 'pending';
  const { label, cls } = map[key] || map.pending;
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>{label}</span>;
};

// ─── Submit Report Modal ───────────────────────────────────────────────────────
/**
 * Backend DTO: SubmitReportDto
 *   { ProjectID: int, Title: string, Description: string,
 *     FilePath: string, ReportType: "Weekly" | "Final" }
 *
 * IMPORTANT: The backend does NOT support binary file uploads for reports.
 * FilePath is a plain string (link to the file, e.g. Google Drive URL).
 * ReportType must be one of the ReportType enum values.
 */
const SubmitModal = ({ team, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title:       '',
    description: '',
    filePath:    '',
    reportType:  'Progress',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload = {
      projectID:   0,
      title:       form.title.trim(),
      description: form.description.trim(),
      filePath:    form.filePath.trim(),
      reportType:  form.reportType,
    };

    console.log('Create report payload:', payload);

    setIsSubmitting(true);
    try {
      await reportService.submitReport(payload);
      toast.success('تم رفع التقرير بنجاح!');
      onSuccess();
      onClose();
    } catch {
      // toast handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">رفع تقرير جديد</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              عنوان التقرير <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="مثال: تقرير الأسبوع الأول"
              required
              className={inputCls}
            />
          </div>

          {/* ReportType */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              نوع التقرير <span className="text-red-500">*</span>
            </label>
            <select
              value={form.reportType}
              onChange={set('reportType')}
              required
              className={inputCls}
            >
              <option value="Progress">تقرير تقدم (Progress)</option>
              <option value="Final">نهائي (Final)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">الوصف</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder="ملخص ما تم إنجازه في هذه الفترة..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* FilePath — string URL, NOT binary upload */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              رابط الملف
              <span className="text-slate-400 font-normal text-xs mr-1">(رابط Google Drive أو OneDrive)</span>
            </label>
            <div className="relative">
              <span className="absolute top-1/2 right-3 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base pointer-events-none">
                link
              </span>
              <input
                type="text"
                value={form.filePath}
                onChange={set('filePath')}
                placeholder="https://drive.google.com/..."
                className={`${inputCls} pr-10`}
                dir="ltr"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الرفع...' : 'رفع التقرير'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
/**
 * GET /reports/my-reports → returns raw Report[]
 * Real fields: ReportID, ProjectID, Title, FilePath, Description,
 *              ReportType, Status, Feedback, SubmissionDate, SubmittedByUserID
 *
 * NO: id, createdAt
 */
const Reports = () => {
  const { team, hasTeam, isLoading: teamLoading } = useMyTeam();
  const { user } = useAuth();

  const isLeader = team && user && user.fullName === team.LeaderName;

  const [reports, setReports]       = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تحميل التقارير');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasTeam) return;
    loadReports();
  }, [hasTeam]);

  const isApproved = team?.status?.toLowerCase() === 'approved' || team?.Status?.toLowerCase() === 'approved';

  if (teamLoading) return <Spinner />;
  if (!hasTeam)   return <NoTeamGate featureName="رفع التقارير" />;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">تقاريري</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">رفع وتتبع تقارير مشروع التخرج</p>
        </div>
        {isLeader && isApproved && (
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">upload_file</span>
            رفع تقرير جديد
          </button>
        )}
      </header>

      {!isApproved && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-400 text-sm font-semibold">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5">info</span>
          <p className="leading-relaxed">
            يجب أن تتم الموافقة على الفريق من قبل الإدارة قبل إرسال التقارير.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">folder_open</span>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">لا توجد تقارير مرفوعة بعد</p>
              {isLeader && (
                <button onClick={() => setShowUpload(true)} className="text-primary font-bold text-sm hover:underline">
                  ارفع أول تقرير ←
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {reports.map((report) => {
                const reportTypeKey = report.reportType ? report.reportType.toLowerCase() : '';
                let reportTypeLabel = report.reportType || '—';
                let reportTypeIcon = 'folder';
                
                if (reportTypeKey === 'weekly') {
                  reportTypeLabel = 'أسبوعي';
                  reportTypeIcon = 'today';
                } else if (reportTypeKey === 'progress') {
                  reportTypeLabel = 'تقرير تقدم';
                  reportTypeIcon = 'trending_up';
                } else if (reportTypeKey === 'final') {
                  reportTypeLabel = 'نهائي';
                  reportTypeIcon = 'task_alt';
                } else if (reportTypeKey === 'proposal') {
                  reportTypeLabel = 'مقترح';
                  reportTypeIcon = 'article';
                }

                return (
                  <div 
                    key={report.reportID} 
                    className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                          {report.title || 'بدون عنوان'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {report.submissionDate
                            ? new Date(report.submissionDate).toLocaleDateString('ar-SA')
                            : '—'}
                        </div>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                      {report.description || 'لا يوجد وصف.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">نوع التقرير</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <span className="material-symbols-outlined text-[16px] text-primary">{reportTypeIcon}</span>
                          {reportTypeLabel}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">المشروع</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          <span className="material-symbols-outlined text-[16px] text-primary">folder</span>
                          <span className="truncate">{report.projectTitle || report.projectName || report.projectID || '—'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">الفريق</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                          <span className="truncate">{report.teamName || '—'}</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">بواسطة</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                          <span className="truncate">{report.submittedByUserName || report.submittedBy || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto">
                      <div className="text-xs text-slate-500 max-w-[60%] truncate" title={report.feedback}>
                        {report.feedback ? `ملاحظات: ${report.feedback}` : 'لا توجد ملاحظات'}
                      </div>
                      <Link
                        to={`/student/reports/${report.reportID}`}
                        className="inline-flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <SubmitModal
          team={team}
          onClose={() => setShowUpload(false)}
          onSuccess={loadReports}
        />
      )}
    </div>
  );
};

export default Reports;
