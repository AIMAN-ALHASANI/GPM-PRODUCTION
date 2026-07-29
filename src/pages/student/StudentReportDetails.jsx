import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const StudentInfoCard = ({ studentInfo }) => (
  <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">ملف الطالب</h2>
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">person</span>
        </div>
        <div>
          <p className="text-xs text-slate-500">الطالب</p>
          <p className="font-bold text-slate-800 dark:text-white">{studentInfo.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">groups</span>
        </div>
        <div>
          <p className="text-xs text-slate-500">اسم الفريق</p>
          <p className="font-bold text-slate-800 dark:text-white">{studentInfo.teamName}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">school</span>
        </div>
        <div>
          <p className="text-xs text-slate-500">المشرف</p>
          <p className="font-bold text-slate-800 dark:text-white">{studentInfo.supervisorName}</p>
        </div>
      </div>
    </div>
  </section>
);

const AttachmentsCard = ({ attachments, onDownload }) => (
  <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">الملفات المرفقة</h2>
    <div className="space-y-3">
      {attachments.map((file) => (
        <button 
          key={file.id} 
          onClick={() => onDownload(file.id)}
          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-${file.iconColor}-500`}>{file.icon}</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{file.name}</span>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">download</span>
        </button>
      ))}
    </div>
  </section>
);

const SupervisorNotesCard = ({ feedback }) => (
  <section className="bg-primary text-white rounded-xl p-6 relative overflow-hidden shadow-lg">
    <div className="absolute -left-8 -bottom-8 opacity-10">
      <span className="material-symbols-outlined text-8xl">rate_review</span>
    </div>
    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex-1 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">ملاحظات المشرف</h2>
        <p className="text-base md:text-lg leading-relaxed italic font-light">{feedback.text}</p>
        <div className="flex items-center gap-2 pt-2">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span className="text-xs font-medium">{feedback.date} • {feedback.time}</span>
        </div>
      </div>
      <div className="md:w-28 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-1">الدرجة</span>
        <span className="text-3xl font-extrabold tracking-tighter">{feedback.grade}<span className="text-base opacity-60">/100</span></span>
      </div>
    </div>
  </section>
);

const SubmissionTimelineCard = ({ timeline }) => (
  <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">الجدول الزمني للتقديم</h2>
    <div className="space-y-6">
      {timeline.map((item, index) => (
        <div key={item.id} className="flex gap-5 relative">
          {item.hasConnector && (
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 absolute left-4 top-8 bottom-[-20px]"></div>
          )}
          <div className={`w-8 h-8 rounded-full bg-${item.iconBg}-100 dark:bg-${item.iconBg}-900/30 text-${item.iconBg}-600 dark:text-${item.iconBg}-400 flex items-center justify-center z-10 shrink-0`}>
            <span className="material-symbols-outlined text-base">{item.icon}</span>
          </div>
          <div className={`flex-1 ${index !== timeline.length - 1 ? 'pb-4 border-b border-slate-100 dark:border-slate-800' : ''}`}>
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              <time className="text-xs font-medium text-slate-400">{item.date}</time>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const ActionButtons = ({ onSubmitNewVersion, onReplyToSupervisor, onDownloadFullReport, isSubmitting }) => (
  <div className="flex flex-wrap items-center gap-4 pt-2">
    <button 
      onClick={onSubmitNewVersion}
      disabled={isSubmitting}
      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-base">publish</span>
      {isSubmitting ? 'جاري التقديم...' : 'تقديم نسخة جديدة'}
    </button>
    <button 
      onClick={onReplyToSupervisor}
      className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-primary rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
    >
      <span className="material-symbols-outlined text-base">reply</span>
      الرد على المشرف
    </button>
    <button 
      onClick={onDownloadFullReport}
      className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-primary transition-all"
    >
      <span className="material-symbols-outlined text-base">download</span>
      تحميل التقرير الكامل
    </button>
  </div>
);

const StudentReportDetails = () => {
  const { id } = useParams();

  const [report, setReport] = useState({
    id: id || 1,
    title: "التقرير التحليلي",
    stage: "المرحلة 02 / التحليل",
    description: "تحقيق شامل في المتطلبات الوظيفية وهيكل النظام لمبادرة المشروع.",
    status: "needs_review",
    statusText: "بحاجة إلى مراجعة",
    statusColor: "amber",
    submissionDate: "٢٤ أكتوبر ٢٠٢٣",
    
    studentInfo: {
      name: "يوسف أحمد",
      teamName: "النواة المبتكرة",
      supervisorName: "د. إيلينا رودريغيز"
    },
    
    attachments: [
      { id: 1, name: "التقرير_التحليلي_v2.pdf", type: "pdf", icon: "picture_as_pdf", iconColor: "red" },
      { id: 2, name: "الرسوم_البيانية_الملحقة.zip", type: "zip", icon: "folder_zip", iconColor: "primary" }
    ],
    
    supervisorFeedback: {
      text: "\"أنماط العمارة الأساسية سليمة، لكن تحليل تدفق البيانات في القسم 3.4 يفتقر إلى العمق المطلوب لمرحلة التنفيذ. يرجى التوسع في منطق إدارة الحالة وإعادة التقديم للموافقة النهائية.\"",
      date: "٢٨ أكتوبر ٢٠٢٣",
      time: "٠٢:١٤ م",
      grade: 72
    },
    
    timeline: [
      {
        id: 1,
        title: "تم استلام الملاحظات",
        description: "اكتملت المراجعة بواسطة د. إيلينا رودريغيز",
        date: "٢٨ أكتوبر",
        icon: "edit_note",
        iconBg: "amber",
        hasConnector: true
      },
      {
        id: 2,
        title: "تم تقديم الإصدار 2.0",
        description: "مسودة منقحة مع مخططات حالات استخدام محدثة",
        date: "٢٤ أكتوبر",
        icon: "upload_file",
        iconBg: "primary",
        hasConnector: true
      },
      {
        id: 3,
        title: "تم إنشاء الإصدار 1.0",
        description: "تم رفع المسودة الأولية للتقرير",
        date: "١٥ أكتوبر",
        icon: "history",
        iconBg: "slate",
        hasConnector: false
      }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownloadAttachment = (fileId) => {
    console.log(`Downloading attachment ID: ${fileId}`);
  };

  const handleSubmitNewVersion = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Submitting new version of report...");
      setIsSubmitting(false);
    }, 1000);
  };

  const handleReplyToSupervisor = () => {
    console.log("Replying to supervisor feedback...");
  };

  const handleDownloadFullReport = () => {
    console.log("Downloading full report...");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/student/reports" className="hover:text-primary">التقارير</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">{report.title}</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <header className="mb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {report.stage}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {report.title}
              </h1>
              <p className="text-slate-500 max-w-2xl text-base">{report.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 bg-${report.statusColor}-100 dark:bg-${report.statusColor}-900/30 text-${report.statusColor}-700 dark:text-${report.statusColor}-400 font-bold rounded-full text-sm`}>
                {report.statusText}
              </span>
              <p className="text-xs text-slate-400">
                تم التقديم في <time className="text-slate-600 dark:text-slate-300 font-medium">{report.submissionDate}</time>
              </p>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="md:col-span-4 space-y-6">
            <StudentInfoCard studentInfo={report.studentInfo} />
            <AttachmentsCard 
              attachments={report.attachments}
              onDownload={handleDownloadAttachment}
            />
          </div>

          {/* Right Column */}
          <div className="md:col-span-8 space-y-6">
            <SupervisorNotesCard 
              feedback={report.supervisorFeedback}
            />
            
            <SubmissionTimelineCard 
              timeline={report.timeline}
            />
            
            <ActionButtons 
              onSubmitNewVersion={handleSubmitNewVersion}
              onReplyToSupervisor={handleReplyToSupervisor}
              onDownloadFullReport={handleDownloadFullReport}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportDetails;
