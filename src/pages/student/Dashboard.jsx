import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useMyTeam from '../../hooks/useMyTeam';
import { useCollegeSupervisors } from '../../hooks/useUsers';
import requestService from '../../services/requestService';
import teamService from '../../services/teamService';
import toast from 'react-hot-toast';

// ─── Quick Link Card ───────────────────────────────────────────────────────────
const QuickLink = ({ to, onClick, icon, label, description, disabled }) => {
  const className = `group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 transition-all w-full text-right ${
    disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:shadow-md hover:border-primary/30'
  }`;
  
  if (onClick) {
    return (
      <button 
        onClick={disabled ? undefined : onClick} 
        disabled={disabled}
        className={className}
      >
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all shrink-0 ${
          disabled 
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
        }`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-905 dark:text-white text-sm">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        </div>
        {!disabled && (
          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 mr-auto group-hover:text-primary transition-colors">chevron_left</span>
        )}
      </button>
    );
  }

  return (
    <Link to={disabled ? '#' : to} className={className} onClick={disabled ? (e) => e.preventDefault() : undefined}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all shrink-0 ${
        disabled 
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
          : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
      }`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-slate-950 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      {!disabled && (
        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 mr-auto group-hover:text-primary transition-colors">chevron_left</span>
      )}
    </Link>
  );
};

// ─── Create Team Modal ────────────────────────────────────────────────────────
const CreateTeamModal = ({ isOpen, onClose, onSubmit, teamName, setTeamName, isSubmitting }) => {
  if (!isOpen) return null;
  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-900 dark:text-white";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right" dir="rtl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">إنشاء فريق جديد</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              اسم الفريق <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="مثال: فريق ألفا"
              required
              className={inputCls}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الفريق'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const { team, hasTeam, isApproved, isPending, isLoading, refetch } = useMyTeam();

  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  // isApproved / isPending come from the hook now
  const hasSupervisor = !!(team?.SupervisorName || team?.supervisorName);
  const hasProject    = !!(team?.ProjectID || team?.projectId || team?.ProjectTitle || team?.projectTitle);

  const isSupervisorDisabled = !isApproved || !hasSupervisor;
  const isProjectDisabled    = !isApproved || !hasProject;

  const handleOpenRequestModal = (type) => {
    if (!hasTeam) {
      toast.error('يجب أن تكون عضواً في فريق لتقديم هذا الطلب');
      return;
    }
    if (!isApproved) {
      const msg = type === 'supervisor'
        ? 'لا يمكنك طلب تغيير المشرف قبل الموافقة على الفريق'
        : 'لا يمكنك طلب تغيير المشروع قبل الموافقة على الفريق';
      toast.error(msg);
      return;
    }
    if (type === 'supervisor') {
      if (!hasSupervisor) {
        toast.error('لا يمكنك طلب تغيير المشرف حيث لم يتم تعيين مشرف للفريق بعد');
        return;
      }
      setIsSupervisorModalOpen(true);
    } else {
      if (!hasProject) {
        toast.error('لا يمكنك طلب تغيير المشروع حيث لم يتم تسجيل مشروع للفريق بعد');
        return;
      }
      setIsProjectModalOpen(true);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setIsSubmittingTeam(true);
    try {
      await teamService.createTeam({ TeamName: teamName.trim() });
      toast.success('تم إنشاء الفريق بنجاح!');
      setIsCreateTeamModalOpen(false);
      setTeamName('');
      refetch();
    } catch {
      // toast handled by apiClient interceptor
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  const isLeader = team && user && Number(user.id) === Number(team.LeaderUserID || team.leaderUserID);

  // Quick links — team/management available for any team, project workflow requires approval
  const quickLinks = [
    { to: '/student/team',            icon: 'group',           label: 'فريقي',          description: 'عرض أعضاء فريقك ومعلوماته', disabled: !hasTeam },
    { to: '/student/team/management', icon: 'manage_accounts', label: 'إدارة الفريق',  description: 'إضافة أعضاء وإدارة الفريق', disabled: !hasTeam },
    { to: '/student/proposals', icon: 'lightbulb',       label: 'المقترح',        description: isApproved ? 'تقديم ومتابعة مقترحات المشروع' : 'متاح بعد موافقة الأدمن', disabled: !isApproved },
    { to: '/student/reports',   icon: 'summarize',       label: 'التقارير',       description: isApproved ? 'رفع وتتبع تقارير المشروع' : 'متاح بعد موافقة الأدمن', disabled: !isApproved },
    { to: '/student/meetings',  icon: 'event_available', label: 'الاجتماعات',     description: isApproved ? 'عرض المواعيد والاجتماعات القادمة' : 'متاح بعد موافقة الأدمن', disabled: !isApproved },
  ];

  if (isLeader) {
    quickLinks.push(
      { 
        onClick: () => handleOpenRequestModal('supervisor'), 
        icon: 'person_edit', 
        label: 'تغيير المشرف', 
        description: !isApproved
          ? 'متاح بعد الموافقة على الفريق'
          : !hasSupervisor
            ? 'يجب تعيين مشرف أولاً لتقديم طلب التغيير'
            : 'تقديم طلب لتغيير مشرف المشروع',
        disabled: isSupervisorDisabled,
      },
      { 
        onClick: () => handleOpenRequestModal('project'), 
        icon: 'edit_note', 
        label: 'تغيير المشروع', 
        description: !isApproved
          ? 'متاح بعد الموافقة على الفريق'
          : !hasProject
            ? 'يجب تسجيل مشروع أولاً لتقديم طلب التغيير'
            : 'تقديم طلب لتغيير عنوان أو وصف المشروع',
        disabled: isProjectDisabled,
      }
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">

      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              مرحباً، {user?.fullName || 'الطالب'} 
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              يمكنك إدارة أنشطة مشروع تخرجك من هنا.
            </p>
          </div>
        </div>
      </div>

      {/* Team Status / Empty State */}
      {!isLoading && (
        hasTeam ? (
          isPending ? (
            // ── Pending Team Banner ─────────────────────────────────────────
            <div className="flex flex-col gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600">hourglass_empty</span>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  فريقك <span className="font-bold">{team?.TeamName || 'فريقك'}</span> بانتظار موافقة الأدمن
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 pr-8">
                يمكنك إدارة الفريق وإضافة الأعضاء حتى تتم الموافقة. ستُفتح باقي الميزات بعد الاعتماد.
              </p>
            </div>
          ) : (
            // ── Approved Team Banner ────────────────────────────────────────
            <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                أنت عضو في فريق: <span className="font-bold">{team?.TeamName || 'فريقك'}</span>
              </span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-3xl">group_off</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">أنت لست ضمن فريق حاليًا</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                بإمكانك إنشاء فريق جديد لتكون قائداً له، أو الانتظار ليقوم قائد فريق آخر بإضافتك.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={() => setIsCreateTeamModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <span className="material-symbols-outlined">add_circle</span>
                إنشاء فريق
              </button>
              <div className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-default">
                <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                انتظار الانضمام إلى فريق
              </div>
            </div>
          </div>
        )
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
          الوصول السريع
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link, index) => (
            <QuickLink key={index} {...link} />
          ))}
        </div>
      </div>

      {/* Request Modals */}
      {isLeader && (
        <>
          <ChangeSupervisorModal
            isOpen={isSupervisorModalOpen}
            onClose={() => setIsSupervisorModalOpen(false)}
            team={team}
          />

          <ChangeProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            team={team}
          />
        </>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onSubmit={handleCreateTeam}
        teamName={teamName}
        setTeamName={setTeamName}
        isSubmitting={isSubmittingTeam}
      />

    </div>
  );
};

// ─── Error Message Extraction Helper ───────────────────────────────────────────
function extractErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (typeof data?.message === "string") return data.message;

  if (typeof data?.Message === "string") return data.Message;

  if (typeof data?.title === "string") return data.title;

  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }

  if (typeof error?.message === "string") return error.message;

  return "Unknown error";
}

// ─── Change Supervisor Modal ──────────────────────────────────────────────────
const ChangeSupervisorModal = ({ isOpen, onClose, team }) => {
  const { data: apiResponse, isLoading: isSupervisorsLoading } = useCollegeSupervisors();

  // Normalize supervisors list as requested in A)
  const rawSupervisors = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);
  const supervisors = rawSupervisors
    .map(sup => {
      const id = Number(sup?.userID ?? sup?.id);
      const fullName = sup?.fullName || sup?.name || '';
      const departmentName = sup?.departmentName || '';
      return { id, fullName, departmentName };
    })
    .filter(sup => Number.isInteger(sup.id) && sup.id > 0 && sup.fullName);

  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedSupervisorId('');
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract and normalize TeamID as requested in C)
  const teamId = Number(team?.teamID ?? team?.TeamID ?? team?.id);
  const hasNoTeam = !teamId || !Number.isInteger(teamId) || teamId <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation before API call as requested in E)
    if (hasNoTeam) {
      toast.error("لا يوجد فريق مرتبط بحسابك");
      return;
    }

    if (!Number.isInteger(teamId) || teamId <= 0) {
      toast.error("معرف الفريق غير صحيح");
      return;
    }

    if (!selectedSupervisorId) {
      toast.error("يرجى اختيار المشرف الجديد");
      return;
    }

    const newSupervisorUserId = Number(selectedSupervisorId);
    if (!newSupervisorUserId || !Number.isInteger(newSupervisorUserId) || newSupervisorUserId <= 0) {
      toast.error("معرف المشرف غير صحيح");
      return;
    }

    if (!reason || !reason.trim()) {
      toast.error("يرجى كتابة سبب التغيير");
      return;
    }

    // Build exact DTO payload as requested in D)
    const payload = {
      TeamID: teamId,
      NewSupervisorUserID: newSupervisorUserId,
      Reason: reason.trim()
    };

    console.log("Change supervisor payload:", payload);

    setIsSubmitting(true);
    try {
      await requestService.changeSupervisor(payload);
      toast.success('تم إرسال طلب تغيير المشرف بنجاح');
      onClose();
    } catch (error) {
      console.error("Change supervisor error:", error?.response?.data || error);
      const errorMsg = extractErrorMessage(error);

      // Custom Arabic error translation as requested in H)
      if (errorMsg.includes("Only the team leader can submit supervisor change requests")) {
        toast.dismiss();
        toast.error("فقط قائد الفريق يمكنه إرسال طلب تغيير المشرف");
      } else if (errorMsg.includes("Team not found")) {
        toast.dismiss();
        toast.error("لم يتم العثور على الفريق");
      } else {
        toast.dismiss();
        toast.error("تعذر إرسال طلب تغيير المشرف");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || isSupervisorsLoading || supervisors.length === 0 || hasNoTeam;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200 text-right" dir="rtl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">طلب تغيير المشرف</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">

            {hasNoTeam && (
              <div className="text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl text-center">
                لا يوجد فريق مرتبط بحسابك
              </div>
            )}



            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">المشرف الجديد</label>
              {isSupervisorsLoading ? (
                <div className="text-xs text-slate-400 py-2 animate-pulse">جاري تحميل قائمة المشرفين...</div>
              ) : supervisors.length === 0 ? (
                <div className="text-xs text-rose-500 py-2">لا توجد قائمة مشرفين متاحة</div>
              ) : (
                <select
                  value={selectedSupervisorId}
                  onChange={(e) => setSelectedSupervisorId(e.target.value)}
                  required
                  disabled={hasNoTeam}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">اختر المشرف الجديد</option>
                  {supervisors.map((sup) => (
                    <option key={`supervisor-${sup.id}`} value={sup.id}>
                      {sup.fullName} - {sup.departmentName || 'بدون قسم'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">سبب التغيير</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows="4"
                disabled={hasNoTeam}
                placeholder="اشرح بالتفصيل سبب طلب تغيير المشرف..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white min-h-[100px] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${isSubmitDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-lg">send</span>
              )}
              <span>{isSubmitting ? 'جاري الإرسال...' : 'تقديم الطلب'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Change Project Modal ─────────────────────────────────────────────────────
const ChangeProjectModal = ({ isOpen, onClose, team }) => {
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewProjectTitle('');
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract and normalize TeamID as requested in C)
  const teamId = Number(team?.teamID ?? team?.TeamID ?? team?.id);
  const hasNoTeam = !teamId || !Number.isInteger(teamId) || teamId <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation before API call as requested in E)
    if (hasNoTeam) {
      toast.error("لا يوجد فريق مرتبط بحسابك");
      return;
    }

    if (!Number.isInteger(teamId) || teamId <= 0) {
      toast.error("معرف الفريق غير صحيح");
      return;
    }

    if (!newProjectTitle || !newProjectTitle.trim()) {
      toast.error("يرجى كتابة عنوان المشروع الجديد");
      return;
    }

    if (!reason || !reason.trim()) {
      toast.error("يرجى كتابة سبب التغيير");
      return;
    }

    // Build exact DTO payload as requested in D)
    const payload = {
      TeamID: teamId,
      NewProjectTitle: newProjectTitle.trim(),
      Reason: reason.trim()
    };

    console.log("Change project payload:", payload);

    setIsSubmitting(true);
    try {
      await requestService.changeProject(payload);
      toast.success('تم إرسال طلب تغيير المشروع بنجاح');
      onClose();
    } catch (error) {
      console.error("Change project error:", error?.response?.data || error);
      const errorMsg = extractErrorMessage(error);

      // Custom Arabic error translation as requested in H)
      if (errorMsg.includes("Only the team leader can submit project change requests")) {
        toast.dismiss();
        toast.error("فقط قائد الفريق يمكنه إرسال طلب تغيير المشروع");
      } else if (errorMsg.includes("Team not found")) {
        toast.dismiss();
        toast.error("لم يتم العثور على الفريق");
      } else {
        toast.dismiss();
        toast.error("تعذر إرسال طلب تغيير المشروع");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || hasNoTeam;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200 text-right" dir="rtl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">طلب تغيير المشروع</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">

            {hasNoTeam && (
              <div className="text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl text-center">
                لا يوجد فريق مرتبط بحسابك
              </div>
            )}



            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">عنوان المشروع الجديد</label>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                required
                disabled={hasNoTeam}
                placeholder="أدخل عنوان المشروع المقترح الجديد"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">سبب التغيير</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows="4"
                disabled={hasNoTeam}
                placeholder="اشرح بالتفصيل سبب طلب تغيير عنوان أو وصف المشروع..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all text-slate-900 dark:text-white min-h-[100px] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 ${isSubmitDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="size-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-lg">send</span>
              )}
              <span>{isSubmitting ? 'جاري الإرسال...' : 'تقديم الطلب'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
