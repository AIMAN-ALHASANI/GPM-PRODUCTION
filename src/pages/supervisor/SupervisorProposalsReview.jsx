import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProposalListItem = ({ proposal, isActive, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`p-4 border-r-4 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-colors ${
      isActive 
        ? 'border-primary bg-primary/5' 
        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    <div className="flex justify-between items-start mb-1">
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-500'}`}>
        {proposal.category}
      </span>
      <span className="text-[10px] text-slate-400 italic">{proposal.timeAgo}</span>
    </div>
    <h4 className={`text-sm mb-2 leading-snug ${isActive ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
      {proposal.title}
    </h4>
    <div className="flex items-center gap-2">
      <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
        {proposal.studentInitial}
      </div>
      <span className="text-xs text-slate-600 dark:text-slate-400">{proposal.studentName}</span>
    </div>
  </div>
);

const ProposalDetailsHeader = ({ proposal, onShare, onPrint }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
      <div>
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">السنة الأكاديمية ٢٠٢٤-٢٠٢٥</span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{proposal.title}</h1>
      </div>
      <div className="flex gap-2">
        <button onClick={onShare} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors">
          <span className="material-symbols-outlined text-sm">share</span>
          مشاركة
        </button>
        <button onClick={onPrint} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors">
          <span className="material-symbols-outlined text-sm">print</span>
        </button>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">التصنيف</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{proposal.category}</p>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">مقدم من</p>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{proposal.studentName} (الرقم: {proposal.studentId})</p>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">الحالة</p>
        <div className="flex items-center gap-1.5">
          {proposal.status === 'pending' && <span className="size-2 rounded-full bg-yellow-500 animate-pulse"></span>}
          {proposal.status === 'approved' && <span className="size-2 rounded-full bg-emerald-500"></span>}
          {proposal.status === 'rejected' && <span className="size-2 rounded-full bg-red-500"></span>}
          <p className={`text-sm font-semibold ${
            proposal.status === 'pending' ? 'text-yellow-600' :
            proposal.status === 'approved' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {proposal.status === 'pending' ? 'بانتظار المراجعة' :
             proposal.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ProposalSummary = ({ summaryText }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">description</span>
      ملخص المشروع
    </h2>
    <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-3">
      {summaryText.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  </div>
);

const PDFPreview = ({ zoom, onZoomIn, onZoomOut, onDownload }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[400px]">
    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Detailed_Proposal_V2.pdf</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span onClick={onZoomOut} className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">zoom_out</span>
          <span>{zoom}٪</span>
          <span onClick={onZoomIn} className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">zoom_in</span>
        </div>
        <button onClick={onDownload} className="text-primary text-xs font-bold hover:underline">تحميل PDF</button>
      </div>
    </div>
    <div className="flex-1 bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
      <div 
        className="bg-white dark:bg-slate-900 w-[80%] h-[120%] shadow-2xl p-8 mx-auto mt-8 transform transition-transform"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
      >
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 mb-5 rounded"></div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div className="h-3 w-[90%] bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div className="h-3 w-[95%] bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 my-5 rounded"></div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
          <div className="h-3 w-[85%] bg-slate-100 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="mt-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg h-28 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 text-5xl">image</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/50 dark:from-slate-950/50 to-transparent pointer-events-none"></div>
    </div>
  </div>
);

const NotesEditor = ({ notes, onChange }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">edit_note</span>
      ملاحظات المشرف
    </h2>
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
      <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex gap-4">
        <span className="material-symbols-outlined text-slate-500 cursor-pointer text-lg hover:text-primary">format_bold</span>
        <span className="material-symbols-outlined text-slate-500 cursor-pointer text-lg hover:text-primary">format_italic</span>
        <span className="material-symbols-outlined text-slate-500 cursor-pointer text-lg hover:text-primary">format_list_bulleted</span>
        <span className="material-symbols-outlined text-slate-500 cursor-pointer text-lg hover:text-primary">link</span>
      </div>
      <textarea 
        value={notes}
        onChange={onChange}
        className="w-full p-4 text-sm bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 resize-none outline-none" 
        placeholder="قدم ملاحظات مفصلة للطالب هنا..." 
        rows="4"
      ></textarea>
    </div>
    <p className="text-[10px] text-slate-400 mt-2 italic">ستكون ملاحظاتك مرئية للطالب عند اتخاذ القرار.</p>
  </div>
);

const ActionButtons = ({ onSaveDraft, onReject, onApprove }) => (
  <div className="flex flex-wrap items-center justify-end gap-4 pb-12 pt-4">
    <button onClick={onSaveDraft} className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95">
      <span className="material-symbols-outlined">save</span>
      حفظ كمسودة
    </button>
    <button onClick={onReject} className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95">
      <span className="material-symbols-outlined">cancel</span>
      رفض المقترح
    </button>
    <button onClick={onApprove} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
      <span className="material-symbols-outlined">check_circle</span>
      الموافقة على المقترح
    </button>
  </div>
);

const SupervisorProposalsReview = () => {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      title: "التحليلات التنبؤية بالذكاء الاصطناعي للتخطيط الحضري",
      category: "الذكاء الاصطناعي وعلوم البيانات",
      categoryColor: "primary",
      timeAgo: "منذ ساعتين",
      studentName: "أحمد محمود",
      studentId: "٢٠٢١٠٤٥٢",
      studentInitial: "أ",
      status: "pending",
      isActive: true,
      summaryText: [
        "يقترح هذا المشروع تطوير إطار عمل للتعلم الآلي مصمم لتحليل أنماط النمو الحضري التاريخي ومجموعات البيانات البيئية. الهدف الأساسي هو إنشاء نموذج تنبؤي يساعد مخططي المدن في تحديد المناطق المثلى لتطوير البنية التحتية مع تقليل البصمة البيئية.",
        "من خلال الاستفادة من الشبكات العصبية وبيانات نظم المعلومات الجغرافية، سيقوم النظام بمحاكاة كثافات المرور المستقبلية ومتطلبات المرافق. تهدف هذه الأداة إلى سد الفجوة بين المخططات الحضرية الثابتة والواقع الديناميكي للتوسع الحضري الحديث."
      ]
    },
    {
      id: 2,
      title: "بروتوكول تصويت آمن قائم على البلوكشين",
      category: "الأمن السيبراني",
      categoryColor: "slate",
      timeAgo: "منذ ٥ ساعات",
      studentName: "محمود سامي",
      studentId: "٢٠٢١٠٧٨٣",
      studentInitial: "م",
      status: "pending",
      isActive: false,
      summaryText: [
        "يهدف المشروع إلى بناء نظام تصويت لامركزي يضمن الشفافية والنزاهة باستخدام تقنية البلوكشين..."
      ]
    },
    {
      id: 3,
      title: "طائرات توصيل ذاتية للإمدادات الطبية الريفية",
      category: "إنترنت الأشياء والروبوتات",
      categoryColor: "slate",
      timeAgo: "أمس",
      studentName: "ليلى أحمد",
      studentId: "٢٠٢١٠٩١٢",
      studentInitial: "ل",
      status: "pending",
      isActive: false,
      summaryText: [
        "استخدام طائرات بدون طيار مجهزة بأنظمة تحكم ذكية لتوصيل الأدوية للمناطق النائية بكفاءة عالية..."
      ]
    },
    {
      id: 4,
      title: "منصة SaaS لتتبع الطاقة المستدامة",
      category: "هندسة البرمجيات",
      categoryColor: "slate",
      timeAgo: "منذ يومين",
      studentName: "خالد سامي",
      studentId: "٢٠٢١٠٥٦٧",
      studentInitial: "خ",
      status: "pending",
      isActive: false,
      summaryText: [
        "تطوير منصة سحابية تتيح للشركات مراقبة وتحسين استهلاكها للطاقة لتقليل الانبعاثات الكربونية..."
      ]
    }
  ]);

  const [selectedProposal, setSelectedProposal] = useState(proposals[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);

  const handleSelectProposal = (proposal) => {
    setSelectedProposal(proposal);
    setNotes("");
    setPdfZoom(100);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredProposals = proposals.filter(p => 
    p.title.includes(searchTerm) || p.studentName.includes(searchTerm)
  );

  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  const handleSaveAsDraft = () => {
    console.log('Saved draft for proposal:', selectedProposal.id, 'Notes:', notes);
  };

  const handleApproveProposal = () => {
    console.log('Approved proposal:', selectedProposal.id);
    const updated = proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'approved' } : p);
    setProposals(updated);
    setSelectedProposal({ ...selectedProposal, status: 'approved' });
  };

  const handleRejectProposal = () => {
    console.log('Rejected proposal:', selectedProposal.id);
    const updated = proposals.map(p => p.id === selectedProposal.id ? { ...p, status: 'rejected' } : p);
    setProposals(updated);
    setSelectedProposal({ ...selectedProposal, status: 'rejected' });
  };

  const handleNotesChange = (e) => setNotes(e.target.value);

  const handleZoomIn = () => setPdfZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setPdfZoom(prev => Math.max(prev - 10, 50));

  const handleDownloadPDF = () => {
    console.log('Downloading PDF for proposal:', selectedProposal.id);
  };

  const handleShareProposal = () => {
    console.log('Sharing proposal:', selectedProposal.id);
  };

  const handlePrintProposal = () => {
    console.log('Printing proposal:', selectedProposal.id);
  };

  return (
    <div className="flex h-full min-h-screen">
      {/* Left Sidebar - Proposals List */}
      <aside className="w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0">
        <div className="p-4 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">المقترحات قيد الانتظار</h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} جديد</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pr-4 pl-9 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
              placeholder="ابحث عن مقترح..."
            />
          </div>
        </div>
        <div className="flex-1">
          {filteredProposals.map(proposal => (
            <ProposalListItem 
              key={proposal.id}
              proposal={proposal}
              isActive={selectedProposal?.id === proposal.id}
              onSelect={() => handleSelectProposal(proposal)}
            />
          ))}
          {filteredProposals.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">
              لا توجد مقترحات تطابق البحث
            </div>
          )}
        </div>
      </aside>

      {/* Right Content - Selected Proposal Details */}
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        {selectedProposal ? (
          <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
            <ProposalDetailsHeader 
              proposal={selectedProposal} 
              onShare={handleShareProposal} 
              onPrint={handlePrintProposal} 
            />

            <ProposalSummary summaryText={selectedProposal.summaryText} />

            <PDFPreview 
              zoom={pdfZoom} 
              onZoomIn={handleZoomIn} 
              onZoomOut={handleZoomOut} 
              onDownload={handleDownloadPDF} 
            />

            <NotesEditor 
              notes={notes} 
              onChange={handleNotesChange} 
            />

            <ActionButtons 
              onSaveDraft={handleSaveAsDraft} 
              onReject={handleRejectProposal} 
              onApprove={handleApproveProposal} 
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            يرجى تحديد مقترح من القائمة الجانبية لعرض التفاصيل
          </div>
        )}
      </section>
    </div>
  );
};

export default SupervisorProposalsReview;
