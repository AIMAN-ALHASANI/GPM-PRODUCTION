import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useMyTeam from '../../hooks/useMyTeam';
import teamService from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AddTeamMemberSearch from '../../components/AddTeamMemberSearch';

// ─── Loading Spinner ───────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Approved: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || map.Pending}`}>
      {status === 'Approved' ? 'مفعّل' : status === 'Rejected' ? 'مرفوض' : 'قيد الموافقة'}
    </span>
  );
};

// ─── Team Card ────────────────────────────────────────────────────────────────
/**
 * Renders team info from GET /team/my-team → TeamDto.
 * Real backend fields:
 *   TeamID, TeamName, LeaderName, SupervisorName,
 *   MemberCount (the limit), Status (string), CreatedAt,
 *   Members: string[]   ← just full names, no objects
 */
const TeamCard = ({ team, showAddBtn, onAddMembersClick }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    {/* Header */}
    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">فريق التخرج</span>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
          {team.TeamName}
        </h2>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StatusBadge status={team.Status} />
        <span className="text-xs text-slate-400">
          {team.CreatedAt ? new Date(team.CreatedAt).toLocaleDateString('ar-SA') : ''}
        </span>
      </div>
    </div>

    {/* Meta Grid */}
    <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-slate-100 dark:border-slate-800">
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">قائد الفريق</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-amber-500">star</span>
          {team.LeaderName || 'غير محدد'}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">المشرف</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-slate-400">person</span>
          {team.SupervisorName || 'لم يُعيَّن مشرف بعد'}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">سعة الفريق</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-slate-400">group</span>
          {(team.Members?.length ?? 0)} / {team.MemberCount} عضو
        </p>
      </div>
    </div>

    {/* Members List — Members is string[] from backend */}
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          أعضاء الفريق ({team.Members?.length ?? 0})
        </p>
        {showAddBtn && (
          <button
            onClick={onAddMembersClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            إضافة أعضاء
          </button>
        )}
      </div>
      {(!team.Members || team.Members.length === 0) ? (
        <p className="text-sm text-slate-400 dark:text-slate-600">لا يوجد أعضاء بعد</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {team.Members.map((memberName, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
            >
              {/* Avatar from name initials */}
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {memberName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {memberName}
                </p>
                {/* Leader indicator: if memberName matches LeaderName */}
                {memberName === team.LeaderName && (
                  <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-xs">star</span>
                    قائد الفريق
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Modal Shell ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const MyTeam = () => {
  const { team, hasTeam, isApproved, isPending, isLoading, error, refetch } = useMyTeam();
  const { user } = useAuth();

  const [modal, setModal]           = useState(null); // 'create' | 'add-members' | null
  const [teamName, setTeamName]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    setModal(null);
    setTeamName('');
  };

  // Create team — backend DTO: { TeamName }
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setIsSubmitting(true);
    try {
      await teamService.createTeam({ TeamName: teamName.trim() });
      toast.success('تم إنشاء الفريق بنجاح!');
      closeModal();
      refetch();
    } catch {
      // toast handled by apiClient interceptor
    } finally {
      setIsSubmitting(false);
    }
  };



  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full" dir="rtl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">فريقي</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {hasTeam ? 'نظرة عامة على فريقك الحالي' : 'أنشئ فريقاً جديداً لتكون قائداً له'}
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      {hasTeam && (
        <div className="border-b border-slate-200 dark:border-slate-800 mb-2">
          <nav className="flex gap-8">
            <NavLink
              to="/student/team"
              end
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold text-sm'
                  : 'flex items-center gap-2 px-1 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm'
              }
            >
              <span className="material-symbols-outlined">group</span>
              الفريق
            </NavLink>
            <NavLink
              to="/student/tasks"
              end
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold text-sm'
                  : 'flex items-center gap-2 px-1 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm'
              }
            >
              <span className="material-symbols-outlined">assignment</span>
              المهام
            </NavLink>
          </nav>
        </div>
      )}

      {/* Has Team */}
      {hasTeam && (
        <>
          <TeamCard
            team={team}
            showAddBtn={
              team &&
              user &&
              user.fullName === team.LeaderName &&
              team.Status !== 'Rejected'
            }
            onAddMembersClick={() => setModal('add-members')}
          />
          {/* Pending team notice */}
          {isPending && (
            <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <span className="material-symbols-outlined text-amber-600 shrink-0">hourglass_empty</span>
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  فريقك بانتظار موافقة الأدمن
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  يمكنك إدارة الفريق وإضافة الأعضاء حتى تتم الموافقة. ستُفتح باقي الميزات بعد اعتماد الفريق من الإدارة.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Team */}
      {!hasTeam && (
        <div className="flex flex-col items-center justify-center min-h-[55vh] gap-8">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-400">group</span>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">أنت لست ضمن فريق حاليًا</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs">
              بإمكانك إنشاء فريق جديد لتكون قائداً له، أو الانتظار ليقوم قائد فريق آخر بإضافتك.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setModal('create')}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <span className="material-symbols-outlined">add_circle</span>
              إنشاء فريق
            </button>
            <div className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-default">
              <span className="material-symbols-outlined">hourglass_empty</span>
              انتظار الانضمام إلى فريق
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {modal === 'create' && (
        <Modal title="إنشاء فريق جديد" onClose={closeModal}>
          <form onSubmit={handleCreateTeam} className="space-y-4">
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
              <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}



      {/* Add Members Modal */}
      {modal === 'add-members' && (
        <Modal title="إضافة أعضاء للفريق" onClose={closeModal}>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            ابحث بالاسم أو البريد الإلكتروني لإضافة طالب غير مسجل في أي فريق حالياً.
          </p>
          <AddTeamMemberSearch 
            teamId={team.TeamID} 
            currentMembers={team.Members || []}
            onMemberAdded={() => {
              closeModal();
              refetch();
            }}
            variant="modal"
          />
        </Modal>
      )}
    </div>
  );
};

export default MyTeam;
