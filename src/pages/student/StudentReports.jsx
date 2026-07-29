import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StatusBadge = ({ status, statusText }) => {
  const statusMap = {
    approved: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      dot: 'bg-green-500',
    },
    submitted: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500 animate-pulse',
    },
    pending: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const style = statusMap[status] || statusMap.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${style.bg} ${style.text} text-xs font-bold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {statusText}
    </span>
  );
};

const ReportsTable = ({ reports, onViewReport }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-right">
      <thead>
        <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
          <th className="px-4 py-3 text-right">اسم التقرير</th>
          <th className="px-4 py-3 text-center">الحالة</th>
          <th className="px-4 py-3 text-center">التاريخ</th>
          <th className="px-4 py-3 text-left">الإجراء</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {reports.map((report) => (
          <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary/70">{report.icon}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{report.name}</span>
              </div>
            </td>
            <td className="px-4 py-4 text-center">
              <StatusBadge status={report.status} statusText={report.statusText} />
            </td>
            <td className="px-4 py-4 text-center text-sm text-slate-500">{report.date}</td>
            <td className="px-4 py-4 text-left">
              {report.status !== 'pending' ? (
                <Link 
                  to={`/student/reports/${report.id}`} 
                  className="text-primary font-bold text-sm hover:underline flex items-center gap-1 ml-auto justify-end"
                >
                  عرض <span className="material-symbols-outlined text-sm">visibility</span>
                </Link>
              ) : (
                <button disabled className="text-slate-400 font-bold text-sm cursor-not-allowed flex items-center gap-1 ml-auto">
                  مقفل <span className="material-symbols-outlined text-sm">lock</span>
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SupervisorNotesCard = ({ supervisor, onReply }) => (
  <section className="bg-primary text-white rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-lg">
    <div className="absolute top-0 left-0 p-8 opacity-10 scale-150 pointer-events-none">
      <span className="material-symbols-outlined text-8xl">format_quote</span>
    </div>
    <div className="relative z-10 flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-white/80">rate_review</span>
        <h2 className="text-base font-bold uppercase tracking-wider">ملاحظات المشرف</h2>
      </div>
      <div className="flex items-center gap-3 mb-5">
        <img alt="Supervisor Portrait" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30" src={supervisor.avatar} />
        <div>
          <p className="text-sm font-bold">{supervisor.name}</p>
          <p className="text-[9px] text-white/60 uppercase tracking-wider font-bold">{supervisor.title}</p>
        </div>
      </div>
      <div className="space-y-3 text-white/80 text-sm leading-relaxed border-r-2 border-white/30 pr-4 py-2 flex-1">
        {supervisor.comments.map((comment, index) => (
          <p key={index}>"{comment}"</p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-white/10">
        <button 
          onClick={onReply}
          className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
        >
          الرد على المشرف
        </button>
      </div>
    </div>
  </section>
);

const UploadReportForm = ({ reportTypes, newReport, onReportTypeChange, onCommentsChange, onFileChange, onSubmit, isSubmitting, errors }) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">نوع التقرير</label>
            <select 
              value={newReport.reportType}
              onChange={(e) => onReportTypeChange(e.target.value)}
              className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.reportType ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none`}
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value} disabled={type.value === ""}>{type.label}</option>
              ))}
            </select>
            {errors.reportType && <p className="text-red-500 text-xs mt-1">{errors.reportType}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">تعليقات إضافية</label>
            <textarea 
              value={newReport.comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none resize-none" 
              placeholder="ملاحظات اختيارية للمراجع..." 
              rows="3"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">رفع الملف (PDF فقط)</label>
          <div 
            onClick={handleFileClick}
            className={`flex-1 border-2 border-dashed ${errors.file ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} rounded-xl bg-slate-50/30 dark:bg-slate-800/30 flex flex-col items-center justify-center p-6 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer min-h-[160px]`}
          >
            {!newReport.file ? (
              <>
                <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary transition-colors mb-3">upload_file</span>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">اسحب الملف وأفلته هنا</p>
                <p className="text-[10px] text-slate-400 mt-1">أو تصفح من جهازك</p>
              </>
            ) : (
              <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-green-500 mb-2">task</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{newReport.file.name}</p>
                <p className="text-[10px] text-slate-500 mt-1">{(newReport.file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onFileChange(e.target.files[0]);
                }
              }}
            />
          </div>
          {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
        <button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقرير'}
        </button>
      </div>
    </div>
  );
};

const FormattingGuideCard = ({ onDownload }) => (
  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 text-center">
    <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-primary mx-auto mb-3 shadow-sm">
      <span className="material-symbols-outlined text-2xl">menu_book</span>
    </div>
    <h3 className="font-bold text-slate-800 dark:text-white mb-1">دليل التنسيق</h3>
    <p className="text-xs text-slate-500 mb-4">قم بتحميل دليل تنسيق APA الأحدث لتقاريرك الفنية.</p>
    <button 
      onClick={onDownload}
      className="text-xs font-black uppercase tracking-wider text-primary hover:tracking-widest transition-all"
    >
      تحميل الدليل
    </button>
  </div>
);

const DeadlineCountdownCard = ({ days, hours }) => (
  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 relative overflow-hidden border border-amber-200 dark:border-amber-800">
    <div className="relative z-10">
      <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1">الموعد النهائي يقترب</h3>
      <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">تقرير التنفيذ مستحق خلال:</p>
      <div className="flex gap-5">
        <div className="text-center">
          <span className="block text-2xl font-black text-amber-800 dark:text-amber-300">{days < 10 ? `0${days}` : days}</span>
          <span className="text-[8px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">أيام</span>
        </div>
        <div className="text-center">
          <span className="block text-2xl font-black text-amber-800 dark:text-amber-300">{hours < 10 ? `0${hours}` : hours}</span>
          <span className="text-[8px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">ساعات</span>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-5 -left-5 opacity-10">
      <span className="material-symbols-outlined text-7xl text-amber-800">timer</span>
    </div>
  </div>
);

const StudentReports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([
    {
      id: 1,
      name: "التقرير التحليلي",
      icon: "description",
      status: "approved",
      statusText: "مقبول",
      statusColor: "green",
      date: "١٢ أكتوبر ٢٠٢٣"
    },
    {
      id: 2,
      name: "تقرير التصميم",
      icon: "architecture",
      status: "submitted",
      statusText: "مقدم",
      statusColor: "blue",
      date: "٠٤ نوفمبر ٢٠٢٣"
    },
    {
      id: 3,
      name: "تقرير التنفيذ",
      icon: "code",
      status: "pending",
      statusText: "قيد الانتظار",
      statusColor: "slate",
      date: "—"
    }
  ]);

  const [supervisorNotes, setSupervisorNotes] = useState({
    name: "د. أريث ثورن",
    title: "المشرف الرئيسي",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzL15xVCQwcs4jCoQ1nP-Pubg7qSKDcah3227FDIFCtvLbJXwkptS_GkqXV6r1wsESqr5IWj6ad2aXaE8J32k920jRivbF63LISousJn9cQn8BuS2Ywn4neFSSeh_8IrgcIZIanApCY8Y4ePzl6igAVvT-oXgBIPUinTDc3xsiy0oO_nkHhKqWbUnmZDqx1HUnzVO7D46Rwohsy36NmlEeebUhQpkL-zCJgNK24J4Plx1amRVpjmg5HLF9KmImbBrS8M6lcJlY6_uA",
    comments: [
      "تقرير التصميم قوي من ناحية المنهجية، ولكن المخططات المعمارية في القسم 3.2 تتطلب دقة أعلى فيما يتعلق بطبقات تدفق البيانات.",
      "يرجى مراجعة قسم قابلية التوسع قبل بدء التنفيذ النهائي."
    ]
  });

  const [newReport, setNewReport] = useState({
    reportType: "",
    comments: "",
    file: null
  });

  const [countdown, setCountdown] = useState({
    days: 4,
    hours: 18
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const reportTypes = [
    { value: "", label: "اختر مرحلة..." },
    { value: "analysis", label: "تقرير التحليل" },
    { value: "design", label: "تقرير التصميم" },
    { value: "implementation", label: "تقرير التنفيذ" },
    { value: "testing", label: "تقرير الاختبار وضمان الجودة" }
  ];

  const handleViewReport = (reportId) => {
    navigate(`/student/reports/${reportId}`);
  };

  const handleReplyToSupervisor = () => {
    console.log("Opening reply dialog for supervisor notes...");
  };

  const handleDownloadGuide = () => {
    console.log("Downloading formatting guide...");
  };

  const handleReportTypeChange = (value) => {
    setNewReport(prev => ({ ...prev, reportType: value }));
    if (errors.reportType) {
      setErrors(prev => ({ ...prev, reportType: "" }));
    }
  };

  const handleCommentsChange = (value) => {
    setNewReport(prev => ({ ...prev, comments: value }));
  };

  const handleFileChange = (file) => {
    if (file && file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, file: "يرجى رفع ملف بصيغة PDF فقط." }));
      return;
    }
    
    setNewReport(prev => ({ ...prev, file }));
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newReport.reportType) {
      newErrors.reportType = "يرجى اختيار نوع التقرير.";
    }
    if (!newReport.file) {
      newErrors.file = "يرجى رفع ملف التقرير.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReport = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        console.log("Report submitted successfully:", newReport);
        setIsSubmitting(false);
        // Add to list optimistically
        const selectedTypeLabel = reportTypes.find(t => t.value === newReport.reportType)?.label;
        const newReportItem = {
          id: Date.now(),
          name: selectedTypeLabel || "تقرير جديد",
          icon: "description",
          status: "submitted",
          statusText: "مقدم",
          date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
        };
        setReports(prev => [newReportItem, ...prev]);
        setNewReport({ reportType: "", comments: "", file: null });
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">التقارير</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">المسارات الأكاديمية</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">تقارير التقدم</h1>
            <p className="text-slate-500 max-w-2xl text-lg">إدارة مسار مشروع التخرج. تتبع التقديمات، رفع النسخ الجديدة، ومراجعة ملاحظات هيئة التدريس.</p>
          </div>
        </div>

        {/* Main Grid Layout - Reports List + Supervisor Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Reports List Section */}
          <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory</span>
                قائمة التقارير
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                {reports.length} ملفات نشطة
              </span>
            </div>
            <ReportsTable 
              reports={reports}
              onViewReport={handleViewReport}
            />
          </section>

          {/* Supervisor Notes Section */}
          <SupervisorNotesCard 
            supervisor={supervisorNotes}
            onReply={handleReplyToSupervisor}
          />
        </div>

        {/* Bottom Section - Upload Report + Side Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          
          {/* Upload New Report Section */}
          <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">cloud_upload</span>
              رفع تقرير جديد
            </h2>
            <UploadReportForm 
              reportTypes={reportTypes}
              newReport={newReport}
              onReportTypeChange={handleReportTypeChange}
              onCommentsChange={handleCommentsChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmitReport}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          </section>

          {/* Side Information */}
          <div className="space-y-6">
            <FormattingGuideCard onDownload={handleDownloadGuide} />
            <DeadlineCountdownCard days={countdown.days} hours={countdown.hours} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReports;
