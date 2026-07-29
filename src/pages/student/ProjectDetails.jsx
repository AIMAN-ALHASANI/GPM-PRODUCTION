import React, { useState, useEffect } from 'react';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import useMyTeam from '../../hooks/useMyTeam';
import NoTeamGate from '../../components/common/NoTeamGate';
import toast from 'react-hot-toast';

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    pending:           { label: 'قيد المراجعة',   cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
    active:            { label: 'نشط',            cls: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400' },
    inactive:          { label: 'غير نشط',        cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
    pendingsupervisor: { label: 'بانتظار المشرف',  cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
    approved:          { label: 'مقبول',           cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
    inprogress:        { label: 'قيد التنفيذ',     cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    completed:         { label: 'مكتمل',           cls: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' },
    archived:          { label: 'مؤرشف',           cls: 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
    rejected:          { label: 'مرفوض',           cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  };
  const key = status != null ? String(status).toLowerCase() : 'pending';
  const { label, cls } = styles[key] || styles.pending;
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
};

// ─── Edit Objectives Modal ──────────────────────────────────────────────────────
const EditObjectivesModal = ({ project, onClose, onSaved }) => {
  const [objective, setObjective] = useState(project.objective || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!objective.trim()) {
      toast.error('أهداف المشروع لا يمكن أن تكون فارغة');
      return;
    }
    setSaving(true);
    try {
      const pId = project.projectId || project.projectID || project.ProjectID || project.id;
      await projectService.updateProjectObjectives(pId, objective.trim());
      toast.success('تم تحديث أهداف المشروع بنجاح');
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error updating objectives:', err);
      // errors handled by apiClient interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">تعديل أهداف المشروع</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              بإمكانك تعديل أهداف المشروع فقط بصفتك قائد الفريق
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              أهداف المشروع
              <span className="text-red-500 mr-1">*</span>
            </label>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={10}
              dir="rtl"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm leading-relaxed resize-none"
              placeholder="اكتب أهداف المشروع هنا..."
              required
              disabled={saving}
            />
            <p className="text-[11px] text-slate-400 mt-1 text-left" dir="ltr">
              {objective.length} حرف
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !objective.trim()}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  حفظ التغييرات
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Project Details Page ─────────────────────────────────────────────────────
const ProjectDetails = () => {
  const { user } = useAuth();
  const { hasTeam, isLoading: isTeamLoading } = useMyTeam();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editObjectivesOpen, setEditObjectivesOpen] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'غير متوفر';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'غير متوفر';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const data = await projectService.getMyProject();
      setProject(data);
    } catch (err) {
      // No project is a valid expected state — shown via empty UI, not an error
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch project if the student is in a team
    if (!isTeamLoading && hasTeam) {
      fetchProjectDetails();
    } else if (!isTeamLoading && !hasTeam) {
      setLoading(false);
    }
  }, [hasTeam, isTeamLoading]);

  // Determine if the logged-in user is the team leader
  const currentUserId = Number(user?.id || user?.userID || user?.UserID || 0);
  const leaderUserId = Number(project?.leaderUserID || project?.LeaderUserID || 0);
  const isTeamLeader = currentUserId > 0 && leaderUserId > 0 && currentUserId === leaderUserId;

  if (isTeamLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // Student is not in any team — show the gate and stop
  if (!hasTeam) {
    return <NoTeamGate featureName="عرض تفاصيل المشروع" />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full" dir="rtl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">تفاصيل المشروع</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            عرض معلومات وتفاصيل مشروع التخرج الخاص بفريقك.
          </p>
        </div>
        {isTeamLeader && project && (
          <button
            onClick={() => setEditObjectivesOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            تعديل الأهداف
          </button>
        )}
      </header>

      {!project ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-400">folder_open</span>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">لا يوجد مشروع مخصص بعد</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">
              لم يتم إنشاء أو ربط مشروع تخرج بفريقك الحالي حتى الآن.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">عنوان المشروع</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {project.title || project.Title}
                </h2>
              </div>

              {/* Objectives */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">أهداف المشروع</span>
                  {isTeamLeader && (
                    <button
                      onClick={() => setEditObjectivesOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      تعديل
                    </button>
                  )}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <p 
                    className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {(project.objective || project.Objective) || 'لا توجد أهداف مدخلة حالياً.'}
                  </p>
                </div>
              </div>

              {/* Abstract */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">ملخص المشروع</span>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <p 
                    className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                  >
                    {(project.abstract || project.Abstract) || 'لا يوجد ملخص للمشروع حالياً.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Metadata Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
              <h3 className="font-black text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                بطاقة المشروع
              </h3>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">حالة المشروع</p>
                <StatusBadge status={project.status || project.Status} />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">اسم الفريق</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">group</span>
                  {project.teamName || project.TeamName || 'غير متوفر'}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">المشرف الأكاديمي</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-slate-400">person</span>
                  {project.supervisorName || project.SupervisorName || 'لم يتم تعيين مشرف بعد'}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">تاريخ الإنشاء</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                  {formatDate(project.createdAt || project.CreatedAt)}
                </p>
              </div>

              {isTeamLeader && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center gap-2 text-xs text-primary font-bold">
                    <span className="material-symbols-outlined text-base">star</span>
                    أنت قائد الفريق
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    بإمكانك تعديل أهداف المشروع
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Objectives Modal */}
      {editObjectivesOpen && project && (
        <EditObjectivesModal
          project={project}
          onClose={() => setEditObjectivesOpen(false)}
          onSaved={fetchProjectDetails}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
