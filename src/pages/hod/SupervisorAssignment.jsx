import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import teamService from '../../services/teamService';

const SupervisorAssignment = () => {
    const [pendingTeams, setPendingTeams] = useState([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [availableSupervisors, setAvailableSupervisors] = useState([]);
    const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);

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
        collegeName: supervisor.CollegeName ?? supervisor.collegeName
    });

    useEffect(() => {
        fetchPendingTeams();
    }, []);

    const fetchPendingTeams = async () => {
        setIsLoadingTeams(true);
        try {
            const data = await teamService.getPendingSupervisorTeams();
            setPendingTeams((data || []).map(normalizeTeam));
        } catch (error) {
            console.error('Fetch teams error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL
            });
            toast.error('فشل في جلب الفرق بانتظار المشرفين');
        } finally {
            setIsLoadingTeams(false);
        }
    };

    const handleOpenModal = async (team) => {
        setSelectedTeam(team);
        setSelectedSupervisor('');
        setIsLoadingSupervisors(true);
        try {
            const data = await teamService.getAvailableSupervisorsForTeam(team.teamID);
            setAvailableSupervisors((data || []).map(normalizeSupervisor));
        } catch (error) {
            console.error('Fetch supervisors error:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
                baseURL: error.config?.baseURL
            });
            toast.error('لا يوجد مشرفون متاحون لهذا الفريق');
            setAvailableSupervisors([]);
        } finally {
            setIsLoadingSupervisors(false);
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

        setIsAssigning(true);
        try {
            await teamService.assignSupervisor(selectedTeam.teamID, selectedSupervisor);
            toast.success('تم إسناد المشرف بنجاح');
            handleCloseModal();
            fetchPendingTeams();
        } catch (error) {
            toast.error('فشل إسناد المشرف');
        } finally {
            setIsAssigning(false);
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
                    <div className="p-6 space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 mb-1">الفريق المحدد</p>
                            <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedTeam.teamName}</p>
                            <p className="text-xs text-slate-500 mt-1">{selectedTeam.departmentName} - {selectedTeam.collegeName}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">اختر المشرف المتاح</label>
                            {isLoadingSupervisors ? (
                                <div className="animate-pulse bg-slate-100 dark:bg-slate-800 h-12 rounded-xl w-full"></div>
                            ) : availableSupervisors.length > 0 ? (
                                <select 
                                    value={selectedSupervisor} 
                                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                >
                                    <option value="">-- يرجى اختيار مشرف --</option>
                                    {availableSupervisors.map(sup => (
                                        <option key={sup.userID} value={sup.userID}>
                                            {sup.fullName} ({sup.departmentName})
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
                            disabled={!selectedSupervisor || isAssigning}
                            className="px-6 py-2 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isAssigning && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                            إسناد المشرف
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">إسناد المشرفين</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">إدارة وإسناد المشرفين للفرق المعتمدة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="size-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">pending_actions</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">فرق بانتظار التعيين</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingTeams.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="size-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">how_to_reg</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">جاهزية الإسناد</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">اختر فريقاً لعرض المشرفين المتاحين</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">قائمة الفرق بانتظار المشرف</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الفريق</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">القسم</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">قائد الفريق</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الأعضاء</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoadingTeams ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 text-center text-slate-400">جاري تحميل الفرق...</td>
                                    </tr>
                                ))
                            ) : pendingTeams.length > 0 ? (
                                pendingTeams.map((team) => (
                                    <tr key={team.teamID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{team.teamName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{team.departmentName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{team.leaderName}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{team.memberCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => handleOpenModal(team)}
                                                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 inline-flex"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                                                إسناد مشرف
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">لا توجد فرق بانتظار إسناد مشرف</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AssignmentModal />
        </div>
    );
};

export default SupervisorAssignment;
