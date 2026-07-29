import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import proposalService from '../../services/proposalService';

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { label: 'قيد المراجعة', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    approved: { label: 'مقبول',         cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    rejected: { label: 'مرفوض',         cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
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

// ─── Detail Row ────────────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
      <span className="material-symbols-outlined text-base text-slate-400">{icon}</span>
      {value || '—'}
    </p>
  </div>
);

// ─── ProposalDetails ───────────────────────────────────────────────────────────
/**
 * IMPORTANT: GET /proposals/{id} is restricted to HeadOfDepartment only.
 * Students cannot call it — it returns 403.
 *
 * Solution: Call getMyProposals() (GET /proposals/my-proposals) and find
 * the matching proposal by ReportID from the URL param.
 * This avoids the 403 entirely and is more efficient.
 *
 * Backend Report[] fields: ReportID, Title, Description, FilePath,
 * ReportType, Status, SubmissionDate, Feedback, ProjectID
 */
const ProposalDetails = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all student proposals then find by ReportID
        const list = await proposalService.getMyProposals();
        console.log('Proposals for details:', list);
        const found = Array.isArray(list)
          ? list.find((p) => String(p.reportID) === String(id))
          : null;

        if (!found) {
          setError('لم يتم العثور على هذا المقترح');
        } else {
          setProposal(found);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'فشل تحميل تفاصيل المقترح');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 text-sm">
          {error}
        </div>
        <Link to="/student/proposals" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-base">arrow_forward</span>
          العودة إلى المقترحات
        </Link>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/student/proposals" className="hover:text-primary transition-colors">
          المقترحات
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">
          {proposal.title || '—'}
        </span>
      </nav>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">مقترح مشروع التخرج</span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {proposal.title || '—'}
            </h1>
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        {/* Meta — exact fields from Report entity */}
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5 border-b border-slate-100 dark:border-slate-800">
          <DetailRow
            icon="calendar_today"
            label="تاريخ التقديم"
            value={proposal.submissionDate
              ? new Date(proposal.submissionDate).toLocaleDateString('ar-SA', { dateStyle: 'long' })
              : '—'}
          />
          <DetailRow
            icon="category"
            label="نوع التقرير"
            value={getReportTypeLabel(proposal.reportType)}
          />
          {/* projectID row removed */}
        </div>

        {/* Description */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">الوصف</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-loose whitespace-pre-wrap break-words overflow-wrap-break-word">
            {proposal.description || '—'}
          </p>
        </div>

        {/* Feedback from HOD */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
            ملاحظات رئيس القسم
          </p>
          <div className={`border rounded-xl p-4 ${
            proposal.status?.toLowerCase() === 'approved'
              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
              : proposal.status?.toLowerCase() === 'rejected'
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              : 'bg-primary/5 dark:bg-primary/10 border-primary/20'
          }`}>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-break-word">
              {proposal.feedback || 'لا توجد تعليقات بعد'}
            </p>
          </div>
        </div>

        {/* File */}
        <div className="px-6 py-5">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">ملف المقترح</p>
          {proposal.filePath ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
              <a href={proposal.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-bold hover:underline truncate">
                فتح الملف
              </a>
            </div>
          ) : (
            <p className="text-sm text-slate-400 font-medium">لا يوجد ملف مرفق</p>
          )}
        </div>
      </div>

      {/* Back */}
      <Link
        to="/student/proposals"
        className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1 self-start"
      >
        <span className="material-symbols-outlined text-base">arrow_forward</span>
        العودة إلى المقترحات
      </Link>
    </div>
  );
};

export default ProposalDetails;
