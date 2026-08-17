import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { usePendingSupervisorTeams, useCollegeSupervisors, useAssignSupervisor } from '../../hooks/useTeams';
import teamService from '../../services/teamService';

const SupervisorAssignment = () => {
    const { data: pendingTeams = [], isLoading: isLoadingTeams, isError: isErrorTeams } = usePendingSupervisorTeams();
    const { data: collegeSupervisors = [], isLoading: isLoadingSupervisors, isError: isErrorSupervisors } = useCollegeSupervisors();
    const assignSupervisorMutation = useAssignSupervisor();

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [availableSupervisors, setAvailableSupervisors] = useState([]);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');

    const normalizeTeam = (team) => ({
        ...team,
        teamID: team.TeamID ?? team.teamID ?? team.teamId ?? team.id,
        teamName: team.TeamName ?? team.teamName ?? team.name,
        leaderName: team.LeaderName ?? team.leaderName,
        memberCount: team.MemberCount ?? team.memberCount ?? 0,
        departmentName: team.DepartmentName ?? team.departmentName,
        collegeName: team.CollegeName ?? team.collegeName
    });

    const normalizeSupervisor = (supervisor) => ({
        ...supervisor,
        userID: supervisor.UserID ?? supervisor.userID ?? supervisor.userId ?? supervisor.id,
        fullName: supervisor.FullName ?? supervisor.fullName ?? supervisor.name,
        email: supervisor.Email ?? supervisor.email,
        departmentName: supervisor.DepartmentName ?? supervisor.departmentName,
        collegeName: supervisor.CollegeName ?? supervisor.collegeName,
        currentTeamsCount: supervisor.CurrentTeamsCount ?? supervisor.currentTeamsCount ?? 0
    });

    const handleOpenModal = async (team) => {
        const normalized = normalizeTeam(team);
        setSelectedTeam(normalized);
        setSelectedSupervisor('');
        setIsLoadingAvailable(true);
        try {
            const data = await teamService.getAvailableSupervisorsForTeam(normalized.teamID);
            const list = Array.isArray(data) ? data : [];
            setAvailableSupervisors(list.map(normalizeSupervisor));
        } catch (error) {
            console.error('Fetch available supervisors error:', error);
            toast.error('فشل في جلب المشرفين المتاحين');
            setAvailableSupervisors([]);
        } finally {
            setIsLoadingAvailable(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedTeam(null);
        setAvailableSupervisors([]);
        setSelectedSupervisor('');
    };

    const handleAssign = async () => {
        if (!selectedSupervisor) {
            toast.error('يجب اختيار مشرف قبل الإسناد');
            return;
        }

        try {
            await assignSupervisorMutation.mutateAsync({
                teamId: selectedTeam.teamID,
                supervisorUserId: Number(selectedSupervisor)
            });
            toast.success('تم إسناد المشرف بنجاح');
            handleCloseModal();
        } catch (error) {
            console.error('Assign supervisor error:', error);
            toast.error('فشل إسناد المشرف');
        }
    };

    const AssignmentModal = () => {
        if (!selectedTeam) return null;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">إسناد مشرف للفريق</h2>
                        <button onClick={handleCloseModal} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="p-6 space-y-6 text-right">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 mb-1">الفريق المحدد</p>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedTeam.teamName}</p>
                            <p className="text-xs text-slate-500 mt-1">{selectedTeam.departmentName} - {selectedTeam.collegeName}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">اختر المشرف المتاح</label>
                            {isLoadingAvailable ? (
                                <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-12 rounded-xl w-full"></div>
                            ) : availableSupervisors.length > 0 ? (
                                <select 
                                    value={selectedSupervisor} 
                                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-slate-800 dark:text-slate-100"
                                >
                                    <option value="">-- يرجى اختيار مشرف --</option>
                                    {availableSupervisors.map(sup => (
                                        <option key={sup.userID} value={sup.userID}>
                                            {sup.fullName} ({sup.departmentName}) [الفرق الحالية: {sup.currentTeamsCount}]
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                                    لا يوجد مشرفون متاحون في نفس الكلية حالياً.
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/30">
                        <button 
                            onClick={handleCloseModal}
                            className="px-6 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handleAssign}
                            disabled={!selectedSupervisor || assignSupervisorMutation.isPending}
                            className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {assignSupervisorMutation.isPending && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            إسناد المشرف
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const normalizedCollegeSupervisors = Array.isArray(collegeSupervisors) ? collegeSupervisors.map(normalizeSupervisor) : [];
    const normalizedPendingTeams = Array.isArray(pendingTeams) ? pendingTeams.map(normalizeTeam) : [];

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">إسناد المشرفين</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">إدارة عبء عمل المشرفين وتعيينهم للفرق.</p>
            </div>

            {/* SECTION 1: SUPERVISOR WORKLOAD */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">عبء عمل المشرفين في الكلية</h2>
                        <p className="text-sm text-slate-400 mt-1">يعرض عدد الفرق النشطة الحالية لكل مشرف بالكلية للمساعدة في توزيع المهام بعدالة.</p>
                    </div>
                </div>

                {isLoadingSupervisors ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 h-14 rounded-2xl border border-slate-200 dark:border-slate-800"></div>
                        ))}
                    </div>
                ) : isErrorSupervisors ? (
                    <div className="p-6 text-center text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50">
                        تعذر تحميل عبء عمل المشرفين
                    </div>
                ) : normalizedCollegeSupervisors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {normalizedCollegeSupervisors.map((supervisor) => (
                            <div 
                                key={supervisor.userID} 
                                className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all flex items-center justify-between gap-3 min-w-0"
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-lg">person</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate" title={supervisor.fullName}>
                                        {supervisor.fullName}
                                    </span>
                                </div>
                                
                                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold tabular-nums shrink-0 whitespace-nowrap ${
                                    supervisor.currentTeamsCount === 0 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                    supervisor.currentTeamsCount >= 4 ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-900/50' :
                                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50'
                                }`}>
                                    {supervisor.currentTeamsCount} {supervisor.currentTeamsCount === 1 ? 'فريق' : supervisor.currentTeamsCount === 2 ? 'فريقان' : 'فرق'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                        لا يوجد مشرفون مسجلون في الكلية حالياً.
                    </div>
                )}
            </div>

            {/* SECTION 2: TEAMS REQUIRING ASSIGNMENT */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">الفرق بانتظار إسناد مشرف</h2>
                        <p className="text-sm text-slate-400 mt-1">الفرق المعتمدة في قسمك والتي تتطلب تعيين مشرف أكاديمي للبدء بالمشروع.</p>
                    </div>
                </div>

                {isLoadingTeams ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-48"></div>
                        ))}
                    </div>
                ) : isErrorTeams ? (
                    <div className="p-6 text-center text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50">
                        تعذر تحميل الفرق بانتظار المشرفين
                    </div>
                ) : normalizedPendingTeams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {normalizedPendingTeams.map((team) => (
                            <div 
                                key={team.teamID} 
                                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{team.teamName}</h3>
                                        <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-900/50">
                                            بانتظار مشرف
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-xs">قائد الفريق:</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{team.leaderName || 'غير متوفر'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-xs">القسم:</span>
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">{team.departmentName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-xs">عدد الأعضاء:</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{team.memberCount} أعضاء</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => handleOpenModal(team)}
                                        className="w-full py-2.5 bg-primary text-white hover:bg-primary/95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                                        إسناد مشرف للفريق
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">check_circle</span>
                        <p className="text-base font-bold">لا توجد فرق بانتظار إسناد مشرف حالياً.</p>
                        <p className="text-xs text-slate-400 mt-1">لقد تم تعيين مشرفين لجميع الفرق المعتمدة.</p>
                    </div>
                )}
            </div>

            <AssignmentModal />
        </div>
    );
};

export default SupervisorAssignment;