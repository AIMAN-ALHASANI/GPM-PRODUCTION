import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HODReports = () => {
  const navigate = useNavigate();

  const [reports] = useState([
    { id: 1, projectName: "تحسين الشبكات العصبية", projectCode: "CS-2024-089", stage: "التنفيذ", stageColor: "primary", submittedBy: "أحمد خالد", submittedByInitial: "أ", submissionDate: "١٢ أكتوبر ٢٠٢٣", statusText: "قيد المراجعة", statusColor: "amber" },
    { id: 2, projectName: "معمل التشفير الكمي", projectCode: "PH-2024-012", stage: "التحليل", stageColor: "slate", submittedBy: "ليلى أحمد", submittedByInitial: "ل", submissionDate: "١٠ أكتوبر ٢٠٢٣", statusText: "تمت المراجعة", statusColor: "emerald" },
    { id: 3, projectName: "التخطيط الحضري المستدام", projectCode: "AR-2024-156", stage: "النهائي", stageColor: "primary", submittedBy: "سارة خالد", submittedByInitial: "س", submissionDate: "٠٩ أكتوبر ٢٠٢٣", statusText: "بحاجة إلى مراجعة", statusColor: "red" },
    { id: 4, projectName: "سلسلة التوريد بالبلوكشين", projectCode: "IT-2024-044", stage: "التصميم", stageColor: "slate", submittedBy: "محمود سامي", submittedByInitial: "م", submissionDate: "٠٥ أكتوبر ٢٠٢٣", statusText: "تمت المراجعة", statusColor: "emerald" }
  ]);

  const [stageFilter, setStageFilter] = useState("جميع المراحل");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const stageOptions = ["جميع المراحل", "التحليل", "التصميم", "التنفيذ", "النهائي"];

  const filteredReports = stageFilter === "جميع المراحل" ? reports : reports.filter(r => r.stage === stageFilter);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const currentReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const displayTotal = filteredReports.length > 4 ? filteredReports.length : 128;

  const stageColorMap = { primary: "bg-primary/10 text-primary", slate: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" };
  const statusColorMap = { amber: "text-amber-600", emerald: "text-emerald-600", red: "text-red-600" };
  const statusDotMap = { amber: "bg-amber-500", emerald: "bg-emerald-500", red: "bg-red-500" };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto text-right" dir="rtl">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link to="/hod/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        <span className="text-slate-900 dark:text-white font-medium">التقارير</span>
      </nav>

      <div className="flex flex-col md:flex-row-reverse md:items-end justify-between gap-6 mb-8">
        <div className="text-right">
          <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block">بوابة اللجنة</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">تقارير المشاريع</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg">
            مراقبة ومراجعة المعالم الأكاديمية والجداول الزمنية وإنجاز المراحل عبر جميع مشاريع الطلاب النشطة.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex-row-reverse">
          <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">تصفية المرحلة:</span>
          <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-900 border-none text-sm font-semibold text-primary rounded-lg py-2 pr-3 pl-8 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer text-right">
            {stageOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">اسم المشروع</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">مرحلة التقرير</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">مقدم من</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">تاريخ التقديم</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentReports.length > 0 ? currentReports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-5 text-right">
                    <span className="font-bold text-primary group-hover:text-primary/80">{report.projectName}</span>
                    <p className="text-xs text-slate-400">{report.projectCode}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${stageColorMap[report.stageColor] || 'bg-slate-100 text-slate-600'}`}>{report.stage}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm font-medium">{report.submittedBy}</span>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{report.submittedByInitial}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium text-right">{report.submissionDate}</td>
                  <td className="px-6 py-5 text-right">
                    <span className={`flex items-center gap-1.5 justify-end ${statusColorMap[report.statusColor]} text-xs font-bold`}>
                      {report.statusText}
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[report.statusColor]}`}></span>
                    </span>
                  </td>
                  <td className="px-6 py-5 text-left">
                    <div className="flex items-center justify-start gap-2">
                      <button onClick={() => navigate(`/hod/reports/${report.id}`)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all" title="عرض التقرير">
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all" title="تحميل PDF">
                        <span className="material-symbols-outlined text-base">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">لا توجد تقارير في هذه المرحلة</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 flex-row-reverse">
          <p className="text-xs font-medium text-slate-500 text-right">
            عرض <span className="text-primary font-bold">{currentReports.length}</span> من أصل <span className="text-primary font-bold">{displayTotal}</span> تقريراً
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2 flex-row-reverse">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-all disabled:opacity-30">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-all disabled:opacity-30">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-2xl text-white relative overflow-hidden text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">متوسط وقت المراجعة</p>
          <h3 className="text-3xl font-extrabold mb-3">٤.٢ يوم</h3>
          <p className="text-sm text-white/80 leading-relaxed">زادت سرعة مراجعة اللجنة بنسبة ١٢٪ هذا الفصل.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">الموعد النهائي القادم</p>
          <h3 className="text-xl font-extrabold text-primary">المرحلة ٣ النهائية</h3>
          <div className="mt-6 flex items-end gap-2 justify-end">
            <span className="text-sm font-medium text-slate-500 pb-1">أيام متبقية</span>
            <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">٠٣</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">اتجاه التقديم</p>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">أعلى</span>
            <span className="text-2xl font-bold text-primary">+٢٨٪</span>
          </div>
          <div className="h-14 flex items-end gap-1 mt-4 flex-row-reverse">
            {[40, 60, 45, 75, 100, 90].map((h, i) => (
              <div key={i} className={`w-full rounded-t-sm ${i >= 3 ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-700'}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODReports;
