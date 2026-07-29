import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useMyTeam from '../../hooks/useMyTeam';
import teamService from '../../services/teamService';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import AddTeamMemberSearch from '../../components/AddTeamMemberSearch';

const TeamMemberRow = ({ member, isCurrentUserLeader, onRemoveMember, onAssignLeader }) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
          {(member.fullName || member.FullName || '?').charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-white">{member.fullName || member.FullName}</p>
          <p className="text-xs text-slate-500">{member.email || member.Email}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-5 font-mono text-sm text-slate-600 dark:text-slate-400">{member.studentNumber || '—'}</td>
    <td className="px-6 py-5">
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isLeader ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
        {member.isLeader ? 'قائد الفريق' : 'عضو'}
      </span>
    </td>
    {isCurrentUserLeader && (
      <td className="px-6 py-5 text-left flex justify-end gap-2">
        {!member.isLeader && (
          <>
            <button
              onClick={() => onAssignLeader(member.userID || member.UserID)}
              title="تعيين كقائد"
              className="text-slate-400 hover:text-amber-500 transition-colors"
            >
              <span className="material-symbols-outlined text-base">star</span>
            </button>
            <button
              onClick={() => onRemoveMember(member.userID || member.UserID)}
              title="إزالة العضو"
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-base">person_remove</span>
            </button>
          </>
        )}
      </td>
    )}
  </tr>
);

const extractErrorMessage = (error) => {
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
};

const StudentLeaderTeamManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { team, isLoading: teamLoading, hasTeam, refetch: refetchTeam } = useMyTeam();
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const currentMember = members.find(m => m.userID === Number(user?.userID || user?.id || user?.UserID));
  const isTeamLeader = currentMember 
    ? currentMember.isLeader 
    : (team && user && team.LeaderName === user.fullName);

  const normalizeTeamStatus = (status) => {
    if (typeof status === 'number') {
      if (status === 0) return 'pending';
      if (status === 1) return 'approved';
      if (status === 2) return 'rejected';
    }
    return String(status ?? '').toLowerCase();
  };

  const teamStatus = normalizeTeamStatus(team?.Status ?? team?.status);

  const canManageMembers =
    isTeamLeader && teamStatus !== 'rejected';

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'قيد الانتظار';
    }
  };

  const fetchMembers = async () => {
    if (!team?.TeamID) return;
    setIsLoadingMembers(true);
    try {
      const data = await teamService.getTeamMembers(team.TeamID);
      const rawMembers = Array.isArray(data) ? data : [];
      console.log("Team members:", rawMembers);
      const normalized = rawMembers.map((m) => {
        const uId = Number(m.userID ?? m.UserID ?? m.id ?? m.Id);
        const fullName = m.fullName ?? m.FullName ?? "بدون اسم";
        const email = m.email ?? m.Email ?? "";
        const studentNumber = m.studentNumber ?? m.StudentNumber ?? m.universityNumber ?? m.UniversityNumber ?? m.academicNumber ?? m.AcademicNumber ?? m.studentID ?? m.StudentID ?? "—";
        
        // Compute team role
        const roleVal = m.roleInTeam ?? m.RoleInTeam ?? m.teamRole ?? m.TeamRole;
        const isLeader = roleVal === 0 || roleVal === "Leader" || roleVal === "leader" || String(roleVal).toLowerCase() === 'leader';

        return {
          userID: uId,
          fullName,
          email,
          studentNumber,
          isLeader
        };
      });
      setMembers(normalized);
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (hasTeam) {
      fetchMembers();
    }
  }, [hasTeam, team?.TeamID]);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إزالة هذا العضو؟')) return;
    try {
      await teamService.removeMember(team.TeamID, userId);
      toast.success('تمت إزالة العضو بنجاح');
      fetchMembers();
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error(extractErrorMessage(error) || 'فشل في إزالة العضو');
    }
  };

  const handleAssignLeader = async (userId) => {
    if (!window.confirm('هل أنت متأكد من تعيين هذا العضو كقائد جديد للفريق؟ ستفقد صلاحيات القيادة.')) return;
    try {
      await teamService.assignTeamLeader(team.TeamID, userId);
      toast.success('تم تغيير قائد الفريق بنجاح');
      fetchMembers();
    } catch (error) {
      console.error("Assign leader error:", error);
      toast.error(extractErrorMessage(error) || 'فشل في تعيين القائد');
    }
  };

  const handleLeaveTeam = async () => {
    // Get actual member count from frontend members array
    const actualMemberCount = members.length;

    if (isTeamLeader) {
      if (actualMemberCount <= 1) {
        if (!window.confirm("أنت العضو الوحيد في الفريق. عند المغادرة سيتم حذف الفريق نهائيًا. هل تريد المتابعة؟")) {
          return;
        }
      } else {
        toast.error("لا يمكن لقائد الفريق مغادرة الفريق قبل نقل القيادة أو إزالة الأعضاء");
        return;
      }
    } else {
      if (!window.confirm('هل أنت متأكد من مغادرة الفريق؟')) {
        return;
      }
    }

    try {
      await teamService.leaveTeam(team.TeamID);
      const isDeleted = isTeamLeader && actualMemberCount <= 1;
      if (isDeleted) {
        toast.success("تم مغادرة الفريق وحذف الفريق بنجاح");
      } else {
        toast.success("تمت مغادرة الفريق بنجاح");
      }
      refetchTeam();
      navigate('/student/team');
    } catch (error) {
      console.error("Leave team error:", error);
      toast.error(extractErrorMessage(error) || 'فشل في مغادرة الفريق');
    }
  };

  if (teamLoading) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">جاري التحميل...</div>;

  if (!hasTeam) {
    return (
      <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">group_off</span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">يجب أن تكون في فريق لتتمكن من إدارته</h2>
        <Link to="/student/team" className="mt-4 inline-block text-primary font-bold hover:underline">انتقل لصفحة فريقي ←</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">إدارة الفريق</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">إدارة الفريق: {team.TeamName}</h1>
            <p className="text-slate-500 max-w-xl text-base">إضافة وإزالة أعضاء الفريق وتعيين القائد.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">أعضاء الفريق</h3>
                {isLoadingMembers && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">الاسم</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">الرقم الجامعي</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">الدور</th>
                      {canManageMembers && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-left">الإجراءات</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((m) => (
                      <TeamMemberRow 
                        key={`member-${m.userID}`} 
                        member={m} 
                        isCurrentUserLeader={canManageMembers} 
                        onRemoveMember={handleRemoveMember}
                        onAssignLeader={handleAssignLeader}
                      />
                    ))}
                    {members.length === 0 && !isLoadingMembers && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium">لا يوجد أعضاء في الفريق حالياً</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {isTeamLeader ? (
            <aside className="lg:col-span-4 space-y-6">
              {teamStatus === 'rejected' ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-600">block</span>
                    إدارة الأعضاء مغلقة
                  </h3>
                  <p className="text-sm leading-relaxed">
                    لا يمكن إضافة أعضاء لأن الفريق مرفوض من الإدارة.
                  </p>
                </div>
              ) : (
                <>
                  {teamStatus === 'pending' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-sm font-bold mb-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600">info</span>
                        تنبيه حالة الفريق
                      </h4>
                      <p className="text-xs leading-relaxed">
                        الفريق قيد مراجعة الإدارة، لكن يمكنك إضافة أعضاء الآن. إرسال المقترحات والتقارير سيكون متاحًا بعد الموافقة.
                      </p>
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="material-symbols-outlined text-primary">person_add</span>
                      إضافة عضو
                    </h3>
                    <AddTeamMemberSearch 
                      teamId={team.TeamID} 
                      currentMembers={members} 
                      onMemberAdded={fetchMembers} 
                      variant="sidebar" 
                    />
                  </div>
                </>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">info</span>
                  تنبيه
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  تأكد من معرف الطالب الصحيح قبل الإضافة. إضافة الطالب للفريق تمنحه صلاحية الوصول لمقترحات وتقارير الفريق.
                </p>
              </div>

              {/* Leader Team Options block */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-base font-bold">logout</span>
                  خيارات الفريق
                </h4>
                {members.length > 1 ? (
                  <p className="text-xs text-rose-500 leading-relaxed font-semibold">
                    لا يمكن لقائد الفريق مغادرة الفريق قبل نقل القيادة أو إزالة الأعضاء.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    أنت العضو الوحيد في الفريق. عند المغادرة سيتم حذف الفريق نهائياً وتتمكن من الانضمام أو إنشاء فريق آخر.
                  </p>
                )}
                <button
                  onClick={handleLeaveTeam}
                  disabled={members.length > 1}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-colors ${
                    members.length > 1
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  مغادرة الفريق وحذفه
                </button>
              </div>
            </aside>
          ) : (
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  بيانات الفريق
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1 font-semibold">اسم الفريق</span>
                    <span className="font-bold text-slate-800 dark:text-white text-base">{team.TeamName}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1 font-semibold">قائد الفريق</span>
                    <span className="font-bold text-slate-800 dark:text-white text-base">{team.LeaderName || '—'}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1 font-semibold">المشرف</span>
                    <span className="font-bold text-slate-800 dark:text-white text-base">{team.SupervisorName || 'لا يوجد مشرف حالياً'}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1 font-semibold">حالة الفريق</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(team.Status)}`}>
                      {getStatusText(team.Status)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    أنت عضو في هذا الفريق. صلاحيات التعديل (إضافة أو إزالة الأعضاء وتعيين القائد) متاحة فقط لقائد الفريق.
                  </p>
                  
                  <button
                    onClick={handleLeaveTeam}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 py-2.5 rounded-xl font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    مغادرة الفريق
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLeaderTeamManagement;
