import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useMyTeam from '../../hooks/useMyTeam';
import { useAuth } from '../../context/AuthContext';
import proposalService from '../../services/proposalService';
import NoTeamGate from '../../components/common/NoTeamGate';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

/**
 * Backend returns ReportStatus enum values as strings:
 * "Pending" | "Approved" | "Rejected"
 * getMyProposals() returns raw Report[] — field is Status (PascalCase)
 */
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: 'قيد المراجعة', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    approved: { label: 'مقبول',         cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    rejected: { label: 'مرفوض',         cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  };
  // Handle both PascalCase (backend) and lowercase (just in case)
  const key = status ? status.toLowerCase() : 'pending';
  const { label, cls } = map[key] || map.pending;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
/**
 * Uses GET /proposals/my-proposals → returns Report[]
 *
 * Real backend fields (raw Report entity):
 *   ReportID, Title, Description, FilePath, ReportType,
 *   Status, SubmissionDate, Feedback, ProjectID,
 *   SubmittedByUserID
 *
 * NO: id, createdAt, supervisorName, supervisor
 */
const Proposals = () => {
  const { team, hasTeam, isLoading: teamLoading } = useMyTeam();
  const { user } = useAuth();

  const isLeader = team && user && user.fullName === team.LeaderName;

  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    if (!hasTeam) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await proposalService.getMyProposals();
        setProposals(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'فشل تحميل المقترحات');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [hasTeam]);

  const isApproved = team?.status?.toLowerCase() === 'approved' || team?.Status?.toLowerCase() === 'approved';

  if (teamLoading) return <Spinner />;
  if (!hasTeam) return <NoTeamGate featureName="إنشاء مقترح" />;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">مقترحاتي</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">تقديم ومتابعة مقترحات مشروع التخرج</p>
        </div>
        {isLeader && isApproved && (
          <Link
            to="/student/proposals/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined">add_circle</span>
            إنشاء مقترح جديد
          </Link>
        )}
      </header>

      {!isApproved && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-400 text-sm font-semibold">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5">info</span>
          <p className="leading-relaxed">
            يجب أن تتم الموافقة على الفريق من قبل الإدارة قبل إرسال المقترح.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading && <Spinner />}

      {!isLoading && !error && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {proposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">description</span>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">لا توجد مقترحات بعد</p>
              {isLeader && (
                <Link to="/student/proposals/create" className="text-primary font-bold text-sm hover:underline">
                  أنشئ مقترحك الأول ←
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {proposals.map((proposal) => {
                const reportTypeKey = proposal.reportType ? proposal.reportType.toLowerCase() : '';
                let reportTypeLabel = proposal.reportType || '—';
                let reportTypeIcon = 'folder';
                if (reportTypeKey === 'proposal') {
                  reportTypeLabel = 'مقترح';
                  reportTypeIcon = 'article';
                }

                return (
                  <div 
                    key={proposal.reportID} 
                    className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-3">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                          {proposal.title || 'بدون عنوان'}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {proposal.submissionDate
                            ? new Date(proposal.submissionDate).toLocaleDateString('ar-SA')
                            : '—'}
                        </div>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1 min-h-[4.5rem] leading-relaxed">
                      {proposal.description || 'لا يوجد وصف.'}
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
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">تاريخ التقديم</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                          {proposal.submissionDate ? new Date(proposal.submissionDate).toLocaleDateString('ar-SA') : '—'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto gap-2">
                      <div className="text-xs text-slate-500 max-w-[60%] line-clamp-3" title={proposal.feedback}>
                        {proposal.feedback ? `ملاحظات: ${proposal.feedback}` : 'لا توجد ملاحظات'}
                      </div>
                      <Link
                        to={`/student/proposals/${proposal.reportID}`}
                        className="inline-flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-250 shrink-0"
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
    </div>
  );
};

export default Proposals;
