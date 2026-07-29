import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HODSelectSupervisor from './HODSelectSupervisor';

const HODSupervisorAssignment = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([
    { id: 1, title: "تنسيق المرور الذاتي", teamName: "NeuralNodes", field: "المدن الذكية", fieldBadgeColor: "primary", assignedSupervisor: null, status: "pending", statusText: "قيد الانتظار", statusColor: "amber" },
    { id: 2, title: "السجلات الطبية اللامركزية", teamName: "BlockHeal", field: "بلوكشين", fieldBadgeColor: "primary", assignedSupervisor: { name: "د. جوليان ستيرلينغ", initial: "د" }, status: "assigned", statusText: "معين", statusColor: "emerald" },
    { id: 3, title: "معالجة اللغات الطبيعية للهجات منخفضة الموارد", teamName: "LinguistAI", field: "الذكاء الاصطناعي / البرمجة اللغوية", fieldBadgeColor: "primary", assignedSupervisor: null, status: "pending", statusText: "قيد الانتظار", statusColor: "amber" }
  ]);

  const stats = { unassignedProjects: 24, unassignedTrend: "+٣ هذا الأسبوع", totalSupervisors: 86, totalSupervisorsSubtitle: "أعضاء هيئة تدريس نشطين", averageLoad: "٣.٢", averageLoadSubtitle: "مشاريع/مشرف" };
  const [filters, setFilters] = useState({ department: "جميع الأقسام", expertise: "جميع التخصصات", assignmentStatus: "جميع المشاريع" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const departments = ["جميع الأقسام", "علوم الحاسوب", "هندسة البرمجيات", "نظم المعلومات"];
  const expertiseAreas = ["جميع التخصصات", "تعلم الآلة", "الأمن السيبراني", "الحوسبة السحابية"];
  const assignmentStatuses = ["جميع المشاريع", "غير معين فقط", "معين فقط"];

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleModalConfirm = (supervisorId) => {
    const mockSupervisors = { 1: { name: "د. إلينا أليستير", initial: "د" }, 2: { name: "أ. ماركوس ستيرلينغ", initial: "أ" }, 3: { name: "د. جاسمين نجوين", initial: "د" }, 4: { name: "د. روبرت لانغدون", initial: "د" }, 5: { name: "د. نورا عبدالله", initial: "د" } };
    setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, status: "assigned", statusText: "معين", statusColor: "emerald", assignedSupervisor: mockSupervisors[supervisorId] } : p));
    setShowModal(false); setSelectedProject(null);
  };

  let filteredProjects = projects;
  if (filters.assignmentStatus === "غير معين فقط") filteredProjects = filteredProjects.filter(p => p.status === "pending");
  else if (filters.assignmentStatus === "معين فقط") filteredProjects = filteredProjects.filter(p => p.status === "assigned");

  const totalProjects = filteredProjects.length;
  const displayTotal = totalProjects > 3 ? totalProjects : 124;
  const totalPages = Math.ceil(totalProjects / itemsPerPage) || 1;
  const currentProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto text-right" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/hod/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <span className="text-slate-900 dark:text-white font-medium">تعيين المشرفين</span>
      </nav>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">تعيين المشرفين</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">مطابقة الخبرات مع الابتكار لفئة ٢٠٢٤</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        {[
          { title: "المشاريع غير المعينة", value: stats.unassignedProjects, extra: <span className="font-bold text-sm text-amber-600">{stats.unassignedTrend}</span>, gradient: false },
          { title: "إجمالي المشرفين", value: stats.totalSupervisors, extra: <span className="font-medium text-sm text-slate-500">{stats.totalSupervisorsSubtitle}</span>, gradient: false },
          { title: "متوسط العبء", value: stats.averageLoad, extra: <span className="font-medium text-sm text-white/70">{stats.averageLoadSubtitle}</span>, gradient: true }
        ].map((card, i) => (
          <div key={i} className={`col-span-12 lg:col-span-4 rounded-xl p-6 shadow-sm flex flex-col ${card.gradient ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl shadow-primary/20 border-none' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${card.gradient ? 'text-white/70' : 'text-slate-500'}`}>{card.title}</span>
            <div className="flex items-baseline gap-3 mt-2 flex-row-reverse justify-end"><span className={`text-5xl font-extrabold ${card.gradient ? '' : 'text-primary'}`}>{card.value}</span>{card.extra}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-end border border-slate-200 dark:border-slate-800 shadow-sm flex-row-reverse">
        {[{ label: "القسم", key: "department", options: departments }, { label: "خبرة المشرف", key: "expertise", options: expertiseAreas }, { label: "حالة التعيين", key: "assignmentStatus", options: assignmentStatuses }].map(f => (
          <div key={f.key} className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 text-right">{f.label}</label>
            <select value={filters[f.key]} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all py-2.5 px-3 text-slate-900 dark:text-white text-right">
              {f.options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
        <button onClick={() => { setFilters({ department: "جميع الأقسام", expertise: "جميع التخصصات", assignmentStatus: "جميع المشاريع" }); setCurrentPage(1); }} className="bg-slate-100 dark:bg-slate-800 text-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
          إعادة تعيين الفلاتر
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {["عنوان المشروع والفريق", "المجال", "المشرف المعين", "الحالة", "الإجراءات"].map(h => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 ${h === "الإجراءات" ? 'text-left' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentProjects.length > 0 ? currentProjects.map(project => {
                const isAssigned = project.status === 'assigned';
                return (
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5 text-right">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{project.title}</span>
                      <span className="text-xs text-slate-500 mt-0.5 block">الفريق: {project.teamName}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">{project.field}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {isAssigned && project.assignedSupervisor ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm font-semibold">{project.assignedSupervisor.name}</span>
                          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{project.assignedSupervisor.initial}</div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm font-medium italic text-slate-500">غير معين</span>
                          <span className="material-symbols-outlined text-slate-400">person_off</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-${project.statusColor}-600`}>
                        {project.statusText} <span className={`w-2 h-2 rounded-full bg-${project.statusColor}-600`}></span>
                      </span>
                    </td>
                    <td className="px-6 py-5 text-left">
                      {!isAssigned ? (
                        <button onClick={() => { setSelectedProject(project); setShowModal(true); }} className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">تعيين</button>
                      ) : (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => navigate(`/hod/proposals/${project.id}`)} className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">visibility</span></button>
                          <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan="5" className="text-center py-8 text-slate-500">لا توجد مشاريع مطابقة للبحث</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center border-t border-slate-100 dark:border-slate-700 flex-row-reverse">
          <span className="text-xs font-medium text-slate-500 text-right">عرض <span className="text-slate-900 dark:text-white font-bold">{currentProjects.length}</span> من أصل <span className="text-slate-900 dark:text-white font-bold">{displayTotal}</span> مشروعاً</span>
          {totalPages > 1 && (
            <div className="flex gap-2 flex-row-reverse">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white hover:text-primary transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-base">chevron_right</span></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white hover:text-primary transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-base">chevron_left</span></button>
            </div>
          )}
        </div>
      </div>

      {/* Advisory Cards */}
      <div className="mt-10 flex flex-col md:flex-row-reverse gap-6">
        <div className="flex-1 bg-primary/5 rounded-2xl p-8 border border-primary/20 relative overflow-hidden text-right">
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold mb-3 text-primary">إرشادات اللجنة</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed ml-0 mr-auto">عند تعيين المشرفين، قم بإعطاء الأولوية لأعضاء هيئة التدريس ذوي الخبرة في المجال أولاً، ثم قم بموازنة العبء الإجمالي.</p>
            <button className="mt-5 flex items-center gap-2 text-primary font-bold text-sm group justify-end">
               تحميل إرشادات التعيين <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_back</span>
            </button>
          </div>
        </div>
        <div className="md:w-1/3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-8 border border-amber-200 dark:border-amber-800 flex flex-col justify-center text-right">
          <span className="material-symbols-outlined text-3xl text-amber-600 mb-3">priority_high</span>
          <h3 className="text-lg font-extrabold mb-2 text-amber-800 dark:text-amber-300">تحذير العبء الحرج</h3>
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">د. سارة تشن وصلت إلى الحد الأقصى (٦ مشاريع). أي تعيينات إضافية تتطلب موافقة العميد.</p>
        </div>
      </div>

      <HODSelectSupervisor isOpen={showModal} project={selectedProject} onClose={() => { setShowModal(false); setSelectedProject(null); }} onConfirm={handleModalConfirm} />
    </div>
  );
};

export default HODSupervisorAssignment;
