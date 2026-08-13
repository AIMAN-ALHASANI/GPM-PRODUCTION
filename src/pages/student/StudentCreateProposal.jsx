import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import proposalService from '../../services/proposalService';
import useMyTeam from '../../hooks/useMyTeam';
import NoTeamGate from '../../components/common/NoTeamGate';
import toast from 'react-hot-toast';

/**
 * Create Proposal Form
 *
 * Backend endpoint: POST /proposals
 * Request DTO (SubmitProposalDto):
 *   { TeamID: int, Title: string, Description: string, FilePath: string }
 *
 * FilePath is a PLAIN STRING (URL, Google Drive link, or file path).
 * There is NO binary file upload — the backend stores a string path.
 *
 * Important: Only students who are members of a team can submit.
 * The backend validates TeamID membership.
 */

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

const inputCls = (err) =>
  `w-full px-4 py-3 rounded-xl border ${
    err
      ? 'border-red-400 dark:border-red-600 focus:ring-red-200 dark:focus:ring-red-900/30'
      : 'border-slate-200 dark:border-slate-700 focus:ring-primary/30 focus:border-primary'
  } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all`;

const StudentCreateProposal = () => {
  const navigate = useNavigate();
  const { team, hasTeam, isLoading: teamLoading } = useMyTeam();

  const [form, setForm] = useState({
    title:       '',
    description: '',
    filePath:    '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'عنوان المقترح مطلوب';
    if (!form.description.trim()) errs.description = 'الوصف مطلوب';
    // FilePath is optional
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const teamID = team?.teamID ?? team?.TeamID ?? null;

    if (!teamID) {
      toast.error('لم يتم العثور على بيانات الفريق');
      return;
    }

    const payload = {
      teamID:      teamID,
      title:       form.title.trim(),
      description: form.description.trim(),
      filePath:    form.filePath.trim(),
    };

    console.log('Create proposal payload:', payload);

    setIsSubmitting(true);
    try {
      await proposalService.submitProposal(payload);

      toast.success('تم تقديم المقترح بنجاح! سيتم مراجعته من قِبل رئيس القسم.');
      navigate('/student/proposals');
    } catch {
      // Error toast handled by apiClient interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (teamLoading) return <Spinner />;
  if (!hasTeam)   return <NoTeamGate featureName="تقديم مقترح" />;

  const isApproved = team?.status?.toLowerCase() === 'approved' || team?.Status?.toLowerCase() === 'approved';
  
  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto w-full p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-6xl text-amber-500 mb-4 animate-bounce">warning</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">يجب أن تتم الموافقة على الفريق أولاً</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
          يجب أن تتم الموافقة على الفريق من قبل الإدارة قبل إرسال المقترح.
        </p>
        <Link to="/student/proposals" className="inline-block text-primary font-bold hover:underline">← العودة للمقترحات</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/student/proposals" className="hover:text-primary transition-colors">
          المقترحات
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">مقترح جديد</span>
      </nav>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white">إنشاء مقترح جديد</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                الفريق: <span className="font-semibold text-slate-700 dark:text-slate-300">{team?.teamName ?? team?.TeamName ?? '—'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Team Name (Read-only) */}
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
              اسم الفريق
            </label>
            <input
              type="text"
              value={team?.teamName ?? team?.TeamName ?? ''}
              disabled
              className={`${inputCls()} bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed`}
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
              عنوان المقترح <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="مثال: نظام إدارة المستشفيات باستخدام الذكاء الاصطناعي"
              className={inputCls(errors.title)}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
              وصف المقترح <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={set('description')}
              placeholder="اكتب وصف بسيط للمشروع المقترح"
              rows={6}
              className={`${inputCls(errors.description)} resize-none`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            <p className="text-xs text-slate-400 mt-1 text-left ltr">{form.description.length} حرف</p>
          </div>

          {/* FilePath — plain string, not a file upload */}
          <div>
            <label htmlFor="filePath" className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">
              رابط الملف
              <span className="text-slate-400 font-normal mr-1 text-xs">(اختياري — رابط Google Drive أو OneDrive)</span>
            </label>
            <div className="relative">
              <span className="absolute top-1/2 right-3 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl pointer-events-none">
                link
              </span>
              <input
                id="filePath"
                type="text"
                value={form.filePath}
                onChange={set('filePath')}
                placeholder="https://drive.google.com/..."
                className={`${inputCls(errors.filePath)} pr-10`}
                dir="ltr"
              />
            </div>
            {errors.filePath && <p className="text-red-500 text-xs mt-1">{errors.filePath}</p>}
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
            <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">info</span>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              سيتم مراجعة المقترح من قِبل رئيس القسم. ستصلك إشعارات بحالة مقترحك.
              لا يمكنك تقديم أكثر من مقترح في انتظار المراجعة في نفس الوقت.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  جاري التقديم...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  تقديم المقترح
                </>
              )}
            </button>
            <Link
              to="/student/proposals"
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentCreateProposal;
