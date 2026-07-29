import React, { useState, useEffect } from 'react';

const HODSelectSupervisor = ({ isOpen, project, onClose, onConfirm }) => {
  const [supervisors] = useState([
    { id: 1, name: "د. إلينا أليستير", department: "علوم الحاسوب", specialty: "تخصص تعلم الآلة", currentLoad: 1, maxLoad: 5, workloadPercentage: 20, workloadStatus: "ideal", statusText: "عبء مثالي" },
    { id: 2, name: "أ. ماركوس ستيرلينغ", department: "الرياضيات التطبيقية", specialty: "", currentLoad: 3, maxLoad: 5, workloadPercentage: 60, workloadStatus: "medium", statusText: "" },
    { id: 3, name: "د. جاسمين نجوين", department: "هندسة الشبكات العصبية", specialty: "", currentLoad: 4, maxLoad: 5, workloadPercentage: 80, workloadStatus: "critical", statusText: "قريب من السعة" },
    { id: 4, name: "د. روبرت لانغدون", department: "فلسفة الذكاء الاصطناعي", specialty: "", currentLoad: 2, maxLoad: 5, workloadPercentage: 40, workloadStatus: "ideal", statusText: "عبء مثالي" },
    { id: 5, name: "د. نورا عبدالله", department: "أمن المعلومات", specialty: "", currentLoad: 1, maxLoad: 5, workloadPercentage: 20, workloadStatus: "ideal", statusText: "عبء مثالي" }
  ]);

  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { if (isOpen) { setSelectedSupervisorId(null); setSearchTerm(""); } }, [isOpen]);
  useEffect(() => { const handleKeyDown = (e) => { if (e.key === 'Escape' && isOpen) onClose(); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const filteredSupervisors = supervisors.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.department.toLowerCase().includes(term) || (s.specialty && s.specialty.toLowerCase().includes(term));
  });

  const statusColorMap = {
    ideal: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    medium: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
    critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' }
  };
  const progressColorMap = { ideal: 'bg-primary', medium: 'bg-primary', critical: 'bg-red-500' };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 shrink-0 flex-row-reverse">
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">اختيار المشرف</h2>
              <p className="text-sm text-slate-500 mt-1">تعيين عضو هيئة تدريس لـ <span className="font-bold text-primary italic">{project.title}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <span className="material-symbols-outlined text-slate-400">close</span>
            </button>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 shrink-0">
            <div className="relative">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-12 pl-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white text-right" placeholder="ابحث بالاسم، القسم، أو التخصص..." />
              <span className="material-symbols-outlined absolute right-4 top-3.5 text-slate-400">search</span>
            </div>
          </div>
          <div className="overflow-y-auto px-6 py-3 flex-1 min-h-[200px]">
            <div className="space-y-2">
              {filteredSupervisors.length > 0 ? filteredSupervisors.map(supervisor => {
                const isCritical = supervisor.workloadStatus === 'critical';
                const isSelected = selectedSupervisorId === supervisor.id;
                const statusColor = statusColorMap[supervisor.workloadStatus];
                return (
                  <div key={supervisor.id} onClick={() => setSelectedSupervisorId(supervisor.id)} className={`group flex flex-col md:flex-row-reverse items-start md:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-primary ring-1 ring-primary shadow-md bg-primary/5 dark:bg-primary/10' : 'border-transparent hover:border-primary/30 bg-white dark:bg-slate-900 hover:shadow-md'} ${isCritical ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}>
                    <div className="flex items-center gap-4 mb-3 md:mb-0 flex-row-reverse">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">person</span>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-slate-900 dark:text-white">{supervisor.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{supervisor.department} {supervisor.specialty && `/ ${supervisor.specialty}`}</p>
                      </div>
                    </div>
                    <div className="text-right w-full md:w-auto flex flex-row-reverse md:flex-col items-center md:items-end justify-between md:justify-start">
                      <div className="flex items-center gap-2 justify-end mb-1 flex-row-reverse">
                        {supervisor.statusText && <span className={`px-2 py-0.5 ${statusColor.bg} ${statusColor.text} text-[10px] font-bold rounded-full uppercase`}>{supervisor.statusText}</span>}
                        <span className={`text-sm font-bold ${isCritical ? 'text-red-600' : (supervisor.workloadStatus === 'ideal' ? 'text-primary' : 'text-slate-600 dark:text-slate-400')}`}>{supervisor.currentLoad}/{supervisor.maxLoad}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`${progressColorMap[supervisor.workloadStatus]} h-full rounded-full`} style={{ width: `${supervisor.workloadPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="text-center py-8 text-slate-500">لا يوجد مشرفين يطابقون بحثك.</div>}
            </div>
          </div>
          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/30 flex justify-start gap-4 items-center border-t border-slate-100 dark:border-slate-700 shrink-0 flex-row-reverse">
            <button onClick={() => selectedSupervisorId && onConfirm(selectedSupervisorId)} disabled={!selectedSupervisorId} className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              تأكيد التعيين
            </button>
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">إلغاء</button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 left-6 z-[70] hidden lg:block text-right" dir="rtl">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border-l-4 border-primary flex items-start gap-3 max-w-xs flex-row-reverse">
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-base">info</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">موازنة العبء نشطة</p>
            <p className="text-xs text-slate-500 mt-0.5">يتم إعطاء الأولوية للمشرفين الذين لديهم أقل من ٣ مشاريع في خوارزمية التوصية.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HODSelectSupervisor;
