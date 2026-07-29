import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const OverviewSection = ({ description, objectives, methodology }) => (
  <section className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="mb-5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">نظرة عامة مفصلة</span>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">وصف المشروع وأهدافه</h2>
    </div>
    <div className="space-y-5 text-slate-600 dark:text-slate-400 leading-relaxed">
      <p>{description}</p>
      <div className="grid md:grid-cols-2 gap-5 mt-3">
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl">
          <h3 className="font-bold text-sm text-primary mb-3 uppercase tracking-wider">الأهداف الرئيسية</h3>
          <ul className="space-y-2 text-sm">
            {objectives.map((objective, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-sm">done</span> 
                {objective}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl">
          <h3 className="font-bold text-sm text-primary mb-3 uppercase tracking-wider">المنهجية</h3>
          <p className="text-sm">{methodology}</p>
        </div>
      </div>
    </div>
  </section>
);

const PDFPreviewSection = ({ pdfFile, onPreview, onDownload }) => (
  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
          <span className="material-symbols-outlined">picture_as_pdf</span>
        </div>
        <div>
          <h3 className="font-bold text-sm">{pdfFile.name}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">تم الرفع {pdfFile.uploadDate} • {pdfFile.size}</p>
        </div>
      </div>
      <button onClick={onDownload} className="text-slate-400 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">download</span>
      </button>
    </div>
    <div onClick={onPreview} className="aspect-[4/5] bg-slate-100 dark:bg-slate-800/50 relative flex flex-col items-center justify-center group cursor-pointer">
      <div className="absolute inset-0 overflow-hidden opacity-60">
        <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-slate-400">description</span>
        </div>
      </div>
      <div className="relative z-10 bg-white dark:bg-slate-800 backdrop-blur-md p-5 rounded-xl shadow-lg flex flex-col items-center gap-3 border border-slate-200 dark:border-slate-700">
        <span className="material-symbols-outlined text-3xl text-primary">preview</span>
        <p className="font-bold text-slate-900 dark:text-white text-sm">انقر لفتح المعاينة</p>
      </div>
    </div>
  </section>
);

const TeamMembersCard = ({ team }) => (
  <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-4">فريق الابتكار</span>
    <div className="space-y-5">
      {team.map((member) => (
        <div key={member.id} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{member.initial}</div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</h4>
            <p className="text-xs text-slate-500">الرقم الجامعي: {member.universityId}</p>
            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-black uppercase rounded mt-1">
              {member.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const RequestedSupervisorCard = ({ supervisor, academicYear, phase, reviewNumber }) => (
  <section className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
    <div className="relative z-10">
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block mb-4">المشرف المطلوب</span>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">{supervisor.initial}</div>
        <div>
          <h4 className="font-bold text-base">{supervisor.name}</h4>
          <p className="text-indigo-100 text-xs">{supervisor.title}</p>
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t border-white/20">
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-100">السنة الأكاديمية</span>
          <span className="font-bold">{academicYear}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-100">المرحلة</span>
          <span className="font-bold">{phase}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-indigo-100">رقم المراجعة</span>
          <span className="font-bold">{reviewNumber}</span>
        </div>
      </div>
    </div>
  </section>
);

const QuickEvaluationCard = ({ evaluation }) => (
  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">تقييم التقديم</span>
    <div className="flex items-baseline gap-2 mt-2">
      <span className="text-4xl font-black text-primary tracking-tighter">{evaluation.grade}</span>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">الدرجة الداخلية</span>
    </div>
    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-tight">
      {evaluation.matchText}
    </p>
  </div>
);

const SupervisorRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Replace with API call in the future
  const [request] = useState({
    id: id || 1,
    projectType: "مشروع تخرج",
    submissionDate: "١٢ أكتوبر ٢٠٢٤",
    title: "أنظمة الملاحة الذاتية للبحث والإنقاذ في الأماكن المغلقة",
    researchField: "الذكاء الاصطناعي والروبوتات",
    researchFieldIcon: "robot",
    
    description: "يهدف هذا المشروع إلى تطوير خوارزمية SLAM (التحديد المتزامن للموقع ورسم الخرائط) خفيفة الوزن ومحسّنة للطائرات الصغيرة بدون طيار في البيئات الخالية من نظام تحديد المواقع العالمي (GPS). التركيز الأساسي هو على تعزيز الوعي المكاني في البيئات الداخلية الخطرة مثل المباني المنهارة أو المواقع الصناعية أثناء حالات الطوارئ.",
    
    objectives: [
      "رسم خرائط مكاني في الوقت الفعلي بخطأ أقل من ٥ سم.",
      "اكتشاف الأجسام لتحديد هوية الناجين.",
      "اتصال منخفض الكمون مع القاعدة الأرضية."
    ],
    
    methodology: "استخدام مستشعرات LiDAR-lite مع كاميرات الرؤية المجسمة ونموذج YOLOv8 المدرب خصيصاً لبيئات الحوسبة الطرفية.",
    
    pdfFile: {
      name: "Full_Proposal_Draft_V2.pdf",
      uploadDate: "١٢ أكتوبر",
      size: "٤.٢ ميجابايت"
    },
    
    team: [
      { id: 1, name: "جوليانا دوارتي", universityId: "٢٠٢١٠٠٤٥", role: "قائد الفريق", initial: "ج" },
      { id: 2, name: "ماركوس نايت", universityId: "٢٠٢١٠١٩٢", role: "عضو", initial: "م" },
      { id: 3, name: "سارة لين", universityId: "٢٠٢١٠٣٣٤", role: "عضو", initial: "س" }
    ],
    
    requestedSupervisor: {
      name: "د. إيلينا فولكوف",
      title: "باحث أول، قسم الروبوتات",
      initial: "د"
    },
    
    evaluation: {
      grade: "أ+",
      matchPercentage: "٩٤٪",
      matchText: "يتطابق المشروع بنسبة ٩٤٪ مع مجال تركيزك البحثي."
    },
    
    academicYear: "٢٠٢٤ - ٢٠٢٥",
    phase: "المقترح الأولي",
    reviewNumber: "٠١"
  });

  const handleAcceptRequest = () => {
    console.log('Accepted request:', request.id);
    navigate('/supervisor/projects/requests');
  };

  const handleRejectRequest = () => {
    console.log('Rejected request:', request.id);
    navigate('/supervisor/projects/requests');
  };

  const handleAddNote = () => {
    console.log('Add note clicked');
  };

  const handleDownloadPDF = () => {
    console.log('Download PDF clicked');
  };

  const handlePreviewPDF = () => {
    console.log('Preview PDF clicked');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link className="hover:text-primary" to="/supervisor/dashboard">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link className="hover:text-primary" to="/supervisor/projects">مشاريعي</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link className="hover:text-primary" to="/supervisor/projects/requests">طلبات الإشراف</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">تفاصيل الطلب</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{request.projectType}</span>
              <span className="text-slate-500 text-xs tracking-wide">تم التقديم {request.submissionDate}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {request.title}
            </h1>
            <p className="mt-3 text-primary font-semibold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">{request.researchFieldIcon}</span>
              {request.researchField}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleAddNote} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-primary font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              إضافة ملاحظة
            </button>
            <button onClick={handleRejectRequest} className="px-5 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">close</span>
              رفض
            </button>
            <button onClick={handleAcceptRequest} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              قبول الطلب
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <OverviewSection 
              description={request.description} 
              objectives={request.objectives} 
              methodology={request.methodology} 
            />
            
            <PDFPreviewSection 
              pdfFile={request.pdfFile} 
              onPreview={handlePreviewPDF} 
              onDownload={handleDownloadPDF} 
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <TeamMembersCard team={request.team} />
            
            <RequestedSupervisorCard 
              supervisor={request.requestedSupervisor} 
              academicYear={request.academicYear} 
              phase={request.phase} 
              reviewNumber={request.reviewNumber} 
            />
            
            <QuickEvaluationCard evaluation={request.evaluation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorRequestDetails;
