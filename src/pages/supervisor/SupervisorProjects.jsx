import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSupervisorProjects, useUpdateProjectStatus } from '../../hooks/useSupervisor';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon, colorClass, borderClass, bgClass }) => (
  <div className={`bg-white dark:bg-slate-900 p-5 rounded-xl border-l-4 ${borderClass} shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-2 ${bgClass} rounded-lg ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
    </div>
  </div>
);

const getStatusLabel = (status) => {
  switch (status) {
    case 'Pending': return 'قيد الانتظار';
    case 'Approved': return 'مقبول';
    case 'InProgress': return 'قيد التنفيذ';
    case 'Completed': return 'مكتمل';
    case 'Archived': return 'مؤرشف';
    case 'Rejected': return 'مرفوض';
    default: return status;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    case 'Approved': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900';
    case 'InProgress': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900';
    case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900';
    case 'Archived': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900';
    case 'Rejected': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const SupervisorProjects = () => {
  const { data: projects, isLoading, isError } = useSupervisorProjects();
  const updateStatusMutation = useUpdateProjectStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [selectedProject, setSelectedProject] = useState(null);

  const statusOptions = ["الكل", "Pending", "Approved", "InProgress", "Completed"];

  const handleStatusChange = (projectId, newStatus) => {
    updateStatusMutation.mutate({ projectId, status: newStatus });
  };

  const stats = useMemo(() => {
    if (!Array.isArray(projects)) {
      return { total: 0, pending: 0, approved: 0, inProgress: 0, completed: 0 };
    }
    return {
      total: projects.length,
      pending: projects.filter(p => (p.status || p.Status) === 'Pending').length,
      approved: projects.filter(p => (p.status || p.Status) === 'Approved').length,
      inProgress: projects.filter(p => (p.status || p.Status) === 'InProgress').length,
      completed: projects.filter(p => (p.status || p.Status) === 'Completed').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.filter(project => {
      const title = project.title || project.Title || "";
      const teamName = project.teamName || project.TeamName || "";
      const status = project.status || project.Status || "";

      const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          teamName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "الكل" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full pb-10 text-right space-y-8" dir="rtl">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          <div className="h-6 w-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto w-full pb-10 text-center py-20 text-red-500 font-bold" dir="rtl">
        تعذر تحميل المشاريع من الخادم. يرجى المحاولة مرة أخرى لاحقاً.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
        <Link className="hover:text-primary" to="/supervisor/dashboard">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">مشاريعي</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">دليل مشاريعي</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">إدارة وتتبع تقدم جميع مشاريع التخرج المخصصة للسنة الأكاديمية الحالية.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
          <StatCard title="إجمالي المشاريع" value={stats.total} icon="assignment" colorClass="text-primary" borderClass="border-primary" bgClass="bg-primary/10" />
          <StatCard title="قيد الانتظار" value={stats.pending} icon="pending" colorClass="text-slate-500" borderClass="border-slate-500" bgClass="bg-slate-500/10" />
          <StatCard title="مقبولة" value={stats.approved} icon="thumb_up" colorClass="text-blue-500" borderClass="border-blue-500" bgClass="bg-blue-500/10" />
          <StatCard title="قيد التنفيذ" value={stats.inProgress} icon="trending_flat" colorClass="text-amber-500" borderClass="border-amber-500" bgClass="bg-amber-500/10" />
          <StatCard title="مكتملة" value={stats.completed} icon="check_circle" colorClass="text-emerald-500" borderClass="border-emerald-500" bgClass="bg-emerald-500/10" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 mb-6 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right" 
                  placeholder="ابحث عن مشروع حسب العنوان أو اسم الفريق..." 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 transition-colors text-sm">
                  <span className="material-symbols-outlined text-sm">filter_alt</span>
                  الحالة: {getStatusLabel(statusFilter)}
                  <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                </button>
                <div className="absolute right-0 mt-2 w-42 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hidden group-hover:block z-50">
                  <div className="py-2">
                    {statusOptions.map(option => (
                      <button 
                        key={option} 
                        onClick={() => setStatusFilter(option)} 
                        className="w-full text-right px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355"
                      >
                        {getStatusLabel(option)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const projectID = project.projectID || project.ProjectID;
            const title = project.title || project.Title;
            const teamName = project.teamName || project.TeamName;
            const objective = project.objective || project.Objective;
            const status = project.status || project.Status;
            const createdAt = project.createdAt || project.CreatedAt;

            return (
              <div key={projectID} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 text-right h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2 flex-row-reverse">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0 ${getStatusClass(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug flex-1 truncate-2-lines">{title}</h3>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                    {objective || "لا يوجد أهداف محددة للمشروع حالياً."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">الفريق</p>
                      <p className="font-bold truncate">{teamName || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">تاريخ الإنشاء</p>
                      <p className="font-bold tabular-nums">
                        {createdAt ? new Date(createdAt).toLocaleDateString('ar-EG') : '---'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold transition-all"
                  >
                    عرض التفاصيل
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">الحالة:</span>
                    <select
                      value={status}
                      disabled={updateStatusMutation.isPending}
                      onChange={(e) => handleStatusChange(projectID, e.target.value)}
                      className="text-xs font-bold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="Pending">قيد الانتظار</option>
                      <option value="Approved">مقبول</option>
                      <option value="InProgress">قيد التنفيذ</option>
                      <option value="Completed">مكتمل</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-full bg-white dark:bg-slate-900 p-20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">folder_open</span>
              <p className="text-slate-500 font-bold text-lg">لا توجد مشاريع مخصصة لك حالياً.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

// ─── Project Details Modal for Supervisor ─────────────────────────────────────────
const ProjectDetailsModal = ({ project, onClose }) => {
  if (!project) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">تفاصيل المشروع</h2>
          <button onClick={onClose} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">عنوان المشروع</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{project.title || project.Title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">اسم الفريق</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{project.teamName || project.TeamName || 'غير محدد'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">حالة المشروع</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{getStatusLabel(project.status || project.Status)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">أهداف المشروع</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
              {project.objective || project.Objective || 'لا توجد أهداف محددة'}
            </p>
          </div>
          {(project.abstract || project.Abstract) && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ملخص المشروع</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                {project.abstract || project.Abstract}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorProjects;
