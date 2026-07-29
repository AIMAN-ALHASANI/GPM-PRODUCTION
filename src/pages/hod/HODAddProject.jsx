import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HODAddProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ projectTitle: "", researchDescription: "", academicDomain: "الذكاء الاصطناعي وتعلم الآلة", teamMembers: [{ name: "د. سارة جميل", id: 1 }, { name: "ماركوس ثورن", id: 2 }], supervisor: "" });
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const availableTeamMembers = [{ id: 3, name: "أ. أليستير فانس", department: "قسم علوم البيانات" }, { id: 4, name: "د. ليلى وونغ", department: "قسم الذكاء الاصطناعي" }, { id: 5, name: "أ. كريم محمد", department: "قسم هندسة البرمجيات" }];
  const supervisorOptions = [{ id: 1, name: "أ. أليستير فانس (قسم علوم البيانات)" }, { id: 2, name: "د. إلينا رودريغيز (قائد مختبر الذكاء الاصطناعي)" }, { id: 3, name: "أ. جوليان كاين (باحث أول)" }];
  const academicDomains = ["الذكاء الاصطناعي وتعلم الآلة", "الأمن السيبراني", "هندسة البرمجيات"];

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]: value })); if (errors[name]) setErrors(p => ({ ...p, [name]: null })); };
  const handleAddTeamMember = (member) => { if (!formData.teamMembers.find(m => m.id === member.id)) { setFormData(p => ({ ...p, teamMembers: [...p.teamMembers, member] })); } setTeamSearchTerm(""); };
  const handleRemoveTeamMember = (id) => setFormData(p => ({ ...p, teamMembers: p.teamMembers.filter(m => m.id !== id) }));
  const filteredTeamMembers = availableTeamMembers.filter(m => m.name.includes(teamSearchTerm) && !formData.teamMembers.find(s => s.id === m.id));

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectTitle || formData.projectTitle.length < 5) newErrors.projectTitle = "عنوان المشروع مطلوب ويجب أن يكون 5 أحرف على الأقل";
    if (!formData.researchDescription || formData.researchDescription.length < 20) newErrors.researchDescription = "وصف البحث مطلوب ويجب أن يكون 20 حرفاً على الأقل";
    if (formData.teamMembers.length === 0) newErrors.teamMembers = "يجب اختيار عضو فريق واحد على الأقل";
    if (!formData.supervisor) newErrors.supervisor = "يجب اختيار مشرف رئيسي";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) { setIsSubmitting(true); setTimeout(() => { setIsSubmitting(false); navigate('/hod/projects/overview'); }, 1000); }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto text-right" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/hod/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <Link to="/hod/projects/overview" className="hover:text-primary">نظرة عامة على المشاريع</Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <span className="text-slate-900 dark:text-white font-medium">إضافة مشروع جديد</span>
      </nav>
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block text-right">استقبال مؤسسي</span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">إضافة مشروع جديد</h1>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-right">بدء تحقيق بحثي جديد من خلال تحديد نطاق المشروع، وتجميع فريق البحث، وتعيين الإشراف الأكاديمي.</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 text-right">هوية المشروع</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-right">عنوان المشروع</label>
                  <input className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.projectTitle ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-right`} name="projectTitle" value={formData.projectTitle} onChange={handleInputChange} placeholder="مثال: تحسين الشبكات العصبية للحوسبة الكمية" type="text" />
                  {errors.projectTitle && <p className="text-red-500 text-xs mt-1 text-right">{errors.projectTitle}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-right">وصف البحث</label>
                  <textarea className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.researchDescription ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-right`} name="researchDescription" value={formData.researchDescription} onChange={handleInputChange} placeholder="تحديد الأهداف الرئيسية والمنهجية..." rows={5} />
                  {errors.researchDescription && <p className="text-red-500 text-xs mt-1 text-right">{errors.researchDescription}</p>}
                </div>
              </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-right">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-right">المجال الأكاديمي</h3>
                {academicDomains.map(domain => (
                  <label key={domain} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mb-2 flex-row-reverse">
                    <input type="radio" name="academicDomain" value={domain} checked={formData.academicDomain === domain} onChange={handleInputChange} className="text-primary focus:ring-primary w-4 h-4" />
                    <span className="text-sm font-medium">{domain}</span>
                  </label>
                ))}
              </div>
              <div className="text-right">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-right">اختيار أعضاء الفريق</h3>
                <div className="relative">
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                  <input className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-right" placeholder="ابحث بالاسم..." type="text" value={teamSearchTerm} onChange={(e) => setTeamSearchTerm(e.target.value)} />
                  {teamSearchTerm && filteredTeamMembers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
                      {filteredTeamMembers.map(m => (
                        <div key={m.id} onClick={() => handleAddTeamMember(m)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center text-sm flex-row-reverse">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-xs text-slate-500">{m.department}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.teamMembers && <p className="text-red-500 text-xs mt-1 text-right">{errors.teamMembers}</p>}
                <div className="mt-3 flex flex-wrap gap-2 flex-row-reverse">
                  {formData.teamMembers.map(member => (
                    <div key={member.id} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium flex-row-reverse">
                      <span>{member.name}</span>
                      <button type="button" onClick={() => handleRemoveTeamMember(member.id)} className="material-symbols-outlined text-sm hover:text-red-500 transition-colors">close</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-right">تعيين المشرف</h3>
              <select className={`w-full appearance-none bg-slate-50 dark:bg-slate-800 border ${errors.supervisor ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-right pr-4 pl-10`} value={formData.supervisor} onChange={(e) => { setFormData(p => ({ ...p, supervisor: e.target.value })); if (errors.supervisor) setErrors(p => ({ ...p, supervisor: null })); }}>
                <option disabled value="">اختر المشرف الرئيسي</option>
                {supervisorOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
              {errors.supervisor && <p className="text-red-500 text-xs mt-1 text-right">{errors.supervisor}</p>}
            </section>
            <div className="flex flex-col sm:flex-row-reverse items-center justify-start gap-3 pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm disabled:opacity-50">
                {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء المشروع'}
              </button>
              <Link to="/hod/projects/overview" className="w-full sm:w-auto px-6 py-2.5 font-bold text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm text-center">إلغاء</Link>
            </div>
          </form>
        </div>
        <div className="xl:col-span-4 space-y-6 text-right">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">lightbulb</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-right">إرشادات الجودة</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2 flex-row-reverse text-right"><span className="material-symbols-outlined text-primary text-base">check_circle</span>يجب أن تكون العناوين موجزة وتعكس الهدف البحثي الرئيسي بدقة.</li>
              <li className="flex gap-2 flex-row-reverse text-right"><span className="material-symbols-outlined text-primary text-base">check_circle</span>يجب أن تتضمن الأوصاف منهجية مختصرة والنتائج المتوقعة.</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-primary text-white text-center"><p className="text-2xl font-bold mb-1">١٢</p><p className="text-[10px] uppercase tracking-wider opacity-80">المواقع المتاحة</p></div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-center"><p className="text-2xl font-bold mb-1">٤٨ س</p><p className="text-[10px] uppercase tracking-wider opacity-60">متوسط الموافقة</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODAddProject;
