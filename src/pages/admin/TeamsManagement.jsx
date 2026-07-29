import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    useCollegeTeams, 
    useUpdateTeamStatus, 
    useDeleteTeam,
    useCreateTeam,
    useUpdateTeam,
    useTeamMembers,
    useAddTeamMember,
    useRemoveTeamMember,
    useAssignTeamLeader 
} from '../../hooks/useTeams';
import TeamDetailsModal from '../../components/admin/TeamDetailsModal';

const TeamsManagement = () => {
    const { data: teamsData, isLoading, isError } = useCollegeTeams();
    const updateStatusMutation = useUpdateTeamStatus();
    const deleteMutation = useDeleteTeam();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('جميع الحالات');
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const teams = Array.isArray(teamsData) ? teamsData : (teamsData?.data || []);

    const getStatusLabel = (status) => {
        // Status Enum: 0: Pending, 1: Active, 2: Suspended
        const statusStr = String(status);
        switch (statusStr) {
            case '0':
            case 'Pending': return { text: 'قيد الانتظار', bg: 'bg-amber-100 text-amber-700', icon: 'pending' };
            case '1':
            case 'Approved': return { text: 'نشط', bg: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' };
            case '2':
            case 'Rejected': return { text: 'معلق', bg: 'bg-rose-100 text-rose-700', icon: 'block' };
            default: return { text: status, bg: 'bg-slate-100 text-slate-700', icon: 'help' };
        }
    };

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             team.leaderName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'جميع الحالات' || getStatusLabel(team.status).text === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewDetails = (e, teamId) => {
        e.preventDefault();
        setSelectedTeamId(teamId);
        setIsDetailsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium">جاري تحميل الفرق...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <span className="material-symbols-outlined text-rose-500 text-5xl">error</span>
                <p className="text-rose-500 font-bold text-xl">فشل في تحميل الفرق</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link className="hover:text-primary" to="/admin/dashboard">الرئيسية</Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">إدارة الفرق</span>
            </nav>

            <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">إدارة فرق العمل</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">مراقبة الفرق الطلابية، إدارة الأعضاء، وتحديث حالات العمل.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="بحث باسم الفريق أو القائد..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm flex-1 sm:flex-none"
                            >
                                <option value="جميع الحالات">جميع الحالات</option>
                                <option value="قيد الانتظار">قيد الانتظار</option>
                                <option value="نشط">نشط</option>
                                <option value="معلق">معلق</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team) => (
                        <div key={team.teamID} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="size-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">groups</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${getStatusLabel(team.status).bg}`}>
                                        <span className="material-symbols-outlined text-sm">{getStatusLabel(team.status).icon}</span>
                                        {getStatusLabel(team.status).text}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{team.teamName}</h3>
                                
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                                        <span className="text-slate-500">القائد:</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{team.leaderName || 'غير محدد'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">supervisor_account</span>
                                        <span className="text-slate-500">المشرف:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{team.supervisorName || 'لم يعين بعد'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">group</span>
                                        <span className="text-slate-500">الأعضاء:</span>
                                        <span className="font-bold text-primary tabular-nums">{team.memberCount || 0} أعضاء</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <button 
                                    onClick={(e) => handleViewDetails(e, team.teamID)}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    عرض التفاصيل
                                    <span className="material-symbols-outlined text-sm">arrow_left</span>
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => updateStatusMutation.mutate({ teamId: team.teamID, statusData: { Status: 1 } })}
                                        className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                                        title="تفعيل"
                                    >
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                    </button>
                                    <button 
                                        onClick={() => deleteMutation.mutate(team.teamID)}
                                        className="size-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                                        title="حذف"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTeams.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-500">
                            لا توجد فرق تطابق المعايير المختارة
                        </div>
                    )}
                </div>
            </div>

            <TeamDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                teamId={selectedTeamId}
            />
        </div>
    );
};

export default TeamsManagement;
