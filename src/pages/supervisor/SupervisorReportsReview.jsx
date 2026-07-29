import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SupervisorReportsReview = () => {
  const [activeDocument, setActiveDocument] = useState("analysis_report");
  const [approvalStatus, setApprovalStatus] = useState("review"); // 'approved', 'review', 'rejected'
  const [rating, setRating] = useState(8.5);
  const [reviewNotes, setReviewNotes] = useState("");
  const [pdfZoom, setPdfZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(42);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("١٠:٤٥ صباحاً");

  const documents = [
    { id: "analysis_report", name: "تقرير التحليل", icon: "description", status: "active", hasReview: true, path: "/supervisor/reports/review/analysis_report" },
    { id: "design_doc", name: "وثيقة التصميم", icon: "architecture", status: "pending", hasReview: false, path: "/supervisor/reports/review/design_doc" },
    { id: "implementation", name: "مرحلة التنفيذ", icon: "code", status: "not_started", hasReview: false, path: "/supervisor/reports/review/implementation" },
    { id: "test_metrics", name: "مقاييس الاختبار", icon: "analytics", status: "draft", hasReview: false, path: "/supervisor/reports/review/test_metrics" }
  ];

  const projectInfo = {
    teamName: "فريق ألفا",
    projectTitle: "نظام إدارة المرور للمدن الذكية",
    submissionDate: "٢٤ أكتوبر ٢٠٢٣",
    memberCount: 4
  };

  const handleDocumentChange = (id) => {
    setActiveDocument(id);
  };

  const handleApprovalStatusChange = (status) => {
    setApprovalStatus(status);
  };

  const handleRatingChange = (e) => {
    setRating(parseFloat(e.target.value));
  };

  const handleReviewNotesChange = (e) => {
    setReviewNotes(e.target.value);
  };

  const handleSendReview = () => {
    console.log("Sending review with status:", approvalStatus, "Rating:", rating, "Notes:", reviewNotes);
    alert("تم إرسال المراجعة بنجاح");
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved("الآن");
    }, 1000);
  };

  const handleZoomIn = () => {
    setPdfZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setPdfZoom(prev => Math.max(prev - 10, 50));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF...");
  };

  const handlePrintPDF = () => {
    console.log("Printing PDF...");
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shrink-0">
        <div className="flex flex-wrap justify-between items-end gap-3">
          <div className="flex flex-col gap-1">
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <Link to="/supervisor/dashboard" className="hover:text-primary">الرئيسية</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <Link to="/supervisor/reports/review" className="hover:text-primary">المراجعات المعلقة</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-medium">{projectInfo.teamName}</span>
            </nav>
            <h1 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-tight">مراجعة التقرير: {projectInfo.teamName}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">المشروع:</span> {projectInfo.projectTitle}
              <span className="mx-2 text-primary/30">|</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">تاريخ التقديم:</span> {projectInfo.submissionDate}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/supervisor/dashboard" className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined ml-2 text-[20px]">arrow_back</span>
              العودة للوحة التحكم
            </Link>
            <button onClick={handleSaveDraft} className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">
              {isSaving ? <span className="material-symbols-outlined ml-2 text-[20px] animate-spin">refresh</span> : <span className="material-symbols-outlined ml-2 text-[20px]">save</span>}
              حفظ التقدم
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace - 3 Columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Document List */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">وثائق المشروع</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <div className="space-y-1 px-2">
              {documents.map(doc => {
                const isActive = activeDocument === doc.id;
                let containerClasses = "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer ";
                let iconClasses = "material-symbols-outlined text-[20px] ";
                let titleClasses = "text-sm font-semibold truncate ";
                let subtitleClasses = "text-[10px] font-medium uppercase tracking-tight ";

                if (isActive) {
                  containerClasses += "bg-primary/5 border border-primary/20";
                  iconClasses += "text-primary";
                  titleClasses = "text-sm font-bold text-slate-900 dark:text-white truncate";
                  subtitleClasses += "text-slate-500";
                } else {
                  containerClasses += "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent";
                  iconClasses += "text-slate-400";
                  titleClasses += "text-slate-700 dark:text-slate-300";
                  subtitleClasses += "text-slate-400";
                }

                let subtitleText = "";
                if (doc.status === "active") subtitleText = "مراجعة نشطة";
                if (doc.status === "pending") subtitleText = "جاهزة للمراجعة";
                if (doc.status === "not_started") subtitleText = "لم تبدأ";
                if (doc.status === "draft") subtitleText = "مسودة";

                return (
                  <div key={doc.id} onClick={() => handleDocumentChange(doc.id)} className={containerClasses}>
                    <span className={iconClasses}>{doc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={titleClasses}>{doc.name}</p>
                      <p className={subtitleClasses}>{subtitleText}</p>
                    </div>
                    {isActive && doc.hasReview && <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 mt-auto border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">group</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{projectInfo.teamName}</p>
                <p className="text-[10px] text-slate-500">{projectInfo.memberCount} أعضاء</p>
              </div>
              <button className="text-primary">
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Middle Section - PDF Viewer */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 flex flex-col p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl flex-1 flex flex-col overflow-hidden border border-slate-300 dark:border-slate-800">
            {/* PDF Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Analysis_Report_V2.pdf</span>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="flex items-center gap-1">
                  <button onClick={handleZoomOut} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
                  <span className="text-sm font-medium px-2">{pdfZoom}٪</span>
                  <button onClick={handleZoomIn} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 ml-2">الصفحة {currentPage} من {totalPages}</span>
                <button onClick={handleNextPage} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                <button onClick={handlePrevPage} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                <button onClick={handleDownloadPDF} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-primary"><span className="material-symbols-outlined text-[20px]">download</span></button>
                <button onClick={handlePrintPDF} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[20px]">print</span></button>
              </div>
            </div>
            {/* PDF Content */}
            <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-6 flex flex-col items-center">
              <div 
                className="bg-white dark:bg-slate-900 w-full max-w-2xl shadow-sm border border-slate-200 dark:border-slate-800 aspect-[1/1.4] relative p-10 origin-top"
                style={{ transform: `scale(${pdfZoom / 100})`, marginBottom: `${(pdfZoom / 100 - 1) * 140}%` }}
              >
                <div className="border-b-2 border-primary w-20 mb-6"></div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3">تقرير تحليل المشروع</h2>
                <h3 className="text-lg text-primary font-semibold mb-8">نظام إدارة المرور للمدن الذكية</h3>
                <div className="space-y-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="pt-6 h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  <div className="pt-10">
                    <div className="relative flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 aspect-video rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">image</span>
                        <p className="text-xs text-slate-400">الشكل ١: تحليل البنية التحتية الحالية</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 opacity-10">
                  <span className="material-symbols-outlined text-6xl">school</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Review Panel */}
        <div className="w-[380px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">rate_review</span>
              ملاحظات المراجعة
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Status Control */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">حالة الموافقة</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleApprovalStatusChange('approved')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    approvalStatus === 'approved' 
                      ? 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${approvalStatus === 'approved' ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`}>check_circle</span>
                  <span className={`text-[10px] font-bold mt-1 uppercase ${approvalStatus === 'approved' ? 'text-emerald-600' : 'text-slate-500 group-hover:text-emerald-600'}`}>موافقة</span>
                </button>
                <button 
                  onClick={() => handleApprovalStatusChange('review')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    approvalStatus === 'review'
                      ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 group'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${approvalStatus === 'review' ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}>history_edu</span>
                  <span className={`text-[10px] font-bold mt-1 uppercase ${approvalStatus === 'review' ? 'text-amber-600' : 'text-slate-500 group-hover:text-amber-600'}`}>مراجعة</span>
                </button>
                <button 
                  onClick={() => handleApprovalStatusChange('rejected')}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    approvalStatus === 'rejected'
                      ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${approvalStatus === 'rejected' ? 'text-red-500' : 'text-slate-400 group-hover:text-red-500'}`}>cancel</span>
                  <span className={`text-[10px] font-bold mt-1 uppercase ${approvalStatus === 'rejected' ? 'text-red-600' : 'text-slate-500 group-hover:text-red-600'}`}>رفض</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">سيؤدي تحديد الحالة إلى تحديث لوحة تحكم الفريق وإشعار جميع الأعضاء عبر البريد الإلكتروني.</p>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>درجة التقييم</span>
                <span className="text-primary">{rating}/١٠</span>
              </label>
              <input 
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" 
                max="10" 
                min="0" 
                step="0.5" 
                type="range" 
                value={rating}
                onChange={handleRatingChange}
              />
              <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                <span>مبتدئ</span>
                <span>خبير</span>
              </div>
            </div>

            {/* Notes Editor */}
            <div className="space-y-2 flex flex-col min-h-[280px]">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ملاحظات مفصلة</label>
              <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 ring-primary/20 ring-offset-0">
                <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex flex-wrap gap-1">
                  <button onClick={() => console.log('Bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
                  <button onClick={() => console.log('Italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
                  <button onClick={() => console.log('Underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_underlined</span></button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 my-auto mx-1"></div>
                  <button onClick={() => console.log('List Bulleted')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
                  <button onClick={() => console.log('List Numbered')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">format_list_numbered</span></button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 my-auto mx-1"></div>
                  <button onClick={() => console.log('Link')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"><span className="material-symbols-outlined text-[18px]">link</span></button>
                </div>
                <textarea 
                  value={reviewNotes}
                  onChange={handleReviewNotesChange}
                  className="flex-1 p-4 w-full bg-transparent border-none focus:ring-0 text-sm resize-none text-slate-700 dark:text-slate-300 placeholder:italic outline-none" 
                  placeholder="ابدأ بكتابة ملاحظاتك التفصيلية لفريق ألفا..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-3">
              <button onClick={handleSendReview} className="w-full py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                <span className="material-symbols-outlined text-[20px]">send</span>
                إرسال المراجعة وإشعار الفريق
              </button>
              <button onClick={handleSaveDraft} className="w-full py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                حفظ كمسودة
              </button>
            </div>
            <p className="mt-3 text-[11px] text-center text-slate-500 uppercase tracking-widest font-medium">آخر حفظ تلقائي الساعة {lastSaved}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorReportsReview;
