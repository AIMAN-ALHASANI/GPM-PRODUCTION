import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const HODEditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ projectTitle: "الخرائط العصبية الذاتية للروبوتات", researchDescription: "يركز هذا المشروع على تطوير نظام رسم خرائط عصبي شامل قادر على الوعي المكاني في الوقت الفعلي.", academicDomain: "الروبوتات والتحكم", projectStatus: "in_progress", projectProgress: 65, progressNote: "تم تحقيق معالم مهمة في تكامل الاستشعار ومعالجة البيانات." });
  const [teamMembers, setTeamMembers] = useState([{ id: 1, name: "أحمد خالد", role: "باحث رئيسي", initial: "أ" }, { id: 2, name: "سارة محمود", role: "أخصائية الشبكات العصبية", initial: "س" }]);
  const [assignedSupervisor, setAssignedSupervisor] = useState({ id: 2, name: "د. روبرت تشن", department: "قسم الروبوتات", workload: 80 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const academicDomains = ["الذكاء الاصطناعي", "الروبوتات والتحكم", "رؤية الحاسوب", "الهندسة العصبية"];
  const projectStatuses = [{ value: "submitted", label: "مقترح مقدم" }, { value: "approved", label: "معتمد" }, { value: "in_progress", label: "قيد التنفيذ" }, { value: "completed", label: "مكتمل" }, { value: "rejected", label: "مرفوض" }];
  const supervisorOptions = [{ id: 1, name: "د. سارة ميلر", workload: "٢/٥", workloadPercentage: 40, department: "قسم الذكاء الاصطناعي" }, { id: 2, name: "د. روبرت تشن", workload: "٤/٥", workloadPercentage: 80, department: "قسم الروبوتات" }, { id: 3, name: "أ. إلينا روسي", workload: "١/٥", workloadPercentage: 20, department: "رؤية الحاسوب" }];
  const availableTeamMembers = [{ id: 3, name: "ليلى وونغ", role: "باحث مساعد", initial: "ل" }, { id: 4, name: "كريم مصطفى", role: "مهندس برمجيات", initial: "ك" }];

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: null })); };
  const handleSupervisorChange = (e) => { const sel = supervisorOptions.find(s => s.id === parseInt(e.target.value)); if (sel) setAssignedSupervisor({ id: sel.id, name: sel.name, department: sel.department, workload: sel.workloadPercentage }); };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectTitle || formData.projectTitle.length < 5) newErrors.projectTitle = "عنوان المشروع مطلوب ويجب أن يكون 5 أحرف على الأقل";
    if (!formData.researchDescription || formData.researchDescription.length < 20) newErrors.researchDescription = "وصف البحث مطلوب ويجب أن يكون 20 حرفاً على الأقل";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) { setIsSubmitting(true); setTimeout(() => { setIsSubmitting(false); navigate(`/hod/projects/${id}`); }, 1000); }
  };

  const handleArchive = () => { if (window.confirm("هل أنت متأكد من أرشفة هذا المشروع؟")) navigate('/hod/projects/overview'); };

  const filteredMembers = availableTeamMembers.filter(m => m.name.includes(searchTerm) && !teamMembers.find(t => t.id === m.id));

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto text-right" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/hod/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <Link to="/hod/projects/overview" className="hover:text-primary">نظرة عامة على المشاريع</Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <span className="text-slate-900 dark:text-white font-medium">تعديل المشروع</span>
      </nav>
      <header className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block text-right">إدارة المشاريع</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">تعديل المشروع: <span className="text-primary">{formData.projectTitle}</span></h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">عنوان المشروع</label>
                <input className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.projectTitle ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-right`} name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} type="text" />
                {errors.projectTitle && <p className="text-red-500 text-xs mt-1 text-right">{errors.projectTitle}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">وصف البحث</label>
                <textarea className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.researchDescription ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm leading-relaxed text-right`} name="researchDescription" value={formData.researchDescription} onChange={handleInputChange} rows={5} />
                {errors.researchDescription && <p className="text-red-500 text-xs mt-1 text-right">{errors.researchDescription}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-row-reverse">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">المجال الأكاديمي</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none text-right" value={formData.academicDomain} onChange={(e) => setFormData(p => ({ ...p, academicDomain: e.target.value }))}>
                    {academicDomains.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">حالة المشروع</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none font-bold text-primary text-right" value={formData.projectStatus} onChange={(e) => setFormData(p => ({ ...p, projectStatus: e.target.value }))}>
                    {projectStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
            <div className="flex justify-between items-center mb-5 flex-row-reverse">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">أعضاء الفريق</h3>
              <div className="relative w-64">
                <input className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right" placeholder="إضافة عضو..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                {searchTerm && filteredMembers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                    {filteredMembers.map(m => <div key={m.id} onClick={() => { setTeamMembers(p => [...p, m]); setSearchTerm(""); }} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center text-sm flex-row-reverse"><span className="font-medium">{m.name}</span><span className="text-xs text-slate-500">{m.role}</span></div>)}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group hover:-translate-x-1 transition-all flex-row-reverse">
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{member.initial}</div>
                    <div className="text-right"><p className="text-sm font-bold">{member.name}</p><p className="text-xs text-slate-500">{member.role}</p></div>
                  </div>
                  <button type="button" onClick={() => setTeamMembers(p => p.filter(m => m.id !== member.id))} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded">
                    <span className="material-symbols-outlined text-sm">remove_circle</span>
                    <span className="text-xs font-bold uppercase tracking-tighter">إزالة</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="lg:col-span-4 space-y-6 text-right">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">المشرف المعين</label>
            <div className="flex items-center gap-3 mb-5 flex-row-reverse">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-2xl">person</span></div>
              <div className="text-right"><p className="text-sm font-bold">{assignedSupervisor.name}</p><p className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">{assignedSupervisor.department}</p></div>
            </div>
            <label className="block text-xs font-medium text-slate-500 mb-2">تغيير المشرف</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none mb-3 text-right" value={assignedSupervisor.id} onChange={handleSupervisorChange}>
              {supervisorOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name} (عبء العمل: {opt.workload})</option>)}
            </select>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-right">
              <div className="flex justify-between items-center text-xs mb-2 flex-row-reverse"><span className="font-medium text-slate-500 text-right">سعة المشرف</span><span className="font-bold text-primary">{assignedSupervisor.workload}%</span></div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full rounded-full" style={{ width: `${assignedSupervisor.workload}%` }}></div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-primary/20 overflow-hidden relative text-right">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-90"></div>
            <div className="relative z-10">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-3">نسبة إنجاز المشروع</label>
              <div className="flex items-baseline gap-2 mb-3 flex-row-reverse justify-end">
                <span className="text-xl font-bold text-white/50">%</span>
                <input className="bg-transparent border-none p-0 text-4xl font-black text-white w-20 focus:ring-0 text-right" type="number" value={formData.projectProgress} onChange={(e) => { let val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0)); setFormData(p => ({ ...p, projectProgress: val })); }} min="0" max="100" />
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mb-4"><div className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${formData.projectProgress}%` }}></div></div>
              <p className="text-xs text-white/70 leading-relaxed italic text-right">"{formData.progressNote}"</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-row-reverse">
            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary text-white font-bold py-3 rounded-xl shadow-md hover:bg-primary/90 transition-all text-sm disabled:opacity-50">
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ المشروع'}
            </button>
            <Link to="/hod/projects/overview" className="bg-slate-100 dark:bg-slate-800 text-primary font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm text-center">إلغاء</Link>
          </div>
          <div className="pt-6 text-center">
            <button onClick={handleArchive} className="text-xs font-bold text-amber-600 uppercase tracking-wider hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors">أرشفة بيانات المشروع</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODEditProject;
