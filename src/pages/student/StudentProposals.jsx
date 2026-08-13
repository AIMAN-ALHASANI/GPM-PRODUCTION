import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProposals } from '../../hooks/useProposals';

const StatsCard = ({ title, value, unit, color, isGradient }) => {
  const colorMap = {
    primary: 'text-primary',
    amber: 'text-amber-600',
    green: 'text-green-600',
    red: 'text-red-600',
  };

  if (isGradient) {
    return (
      <div className="bg-primary/10 p-6 rounded-xl flex flex-col justify-between h-32 shadow-sm border border-primary/20">
        <span className="text-xs font-bold text-primary/70 uppercase tracking-wider">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-primary">{value}%</span>
          <span className="text-primary text-sm font-semibold">{unit}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-32 shadow-sm">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-extrabold ${colorMap[color] || 'text-slate-900'}`}>{value < 10 ? `0${value}` : value}</span>
        <span className={`${colorMap[color] || 'text-slate-900'} text-sm font-semibold`}>{unit}</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, statusText }) => {
  const statusMap = {
    accepted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-600' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-600' },
    pending: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-amber-500' },
  };

  const style = statusMap[status] || statusMap.pending;

  return (
    <span className={`px-4 py-1.5 rounded-full ${style.bg} ${style.text} text-xs font-bold uppercase tracking-wider flex items-center gap-1.5`}>
      <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
      {statusText}
    </span>
  );
};

const ProposalCard = ({ proposal, onViewReason, onMoreOptions }) => {
  const iconStyleMap = {
    primary: 'bg-primary/10 text-primary',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  };

  const iconStyle = iconStyleMap[proposal.iconBg] || iconStyleMap.primary;

  return (
    <div className={`group bg-white dark:bg-slate-900 hover:shadow-md transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 border border-slate-200 dark:border-slate-800 ${proposal.hasBorderLeft ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconStyle.split(' ')[0]}`}>
        <span className={`material-symbols-outlined ${iconStyle.split(' ')[1]}`}>{proposal.icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{proposal.title}</h4>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">calendar_today</span> {proposal.submissionDate}</span>
          {proposal.supervisor && (
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">person</span> المشرف: {proposal.supervisor}</span>
          )}
          {proposal.reason && (
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">warning</span> السبب: {proposal.reason}</span>
          )}
          {proposal.daysRemaining && (
            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span> {proposal.daysRemaining}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {proposal.status === 'rejected' && (
          <button onClick={() => onViewReason(proposal.id)} className="px-5 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            عرض السبب
          </button>
        )}
        <StatusBadge status={proposal.status} statusText={proposal.statusText} />
        <button onClick={() => onMoreOptions(proposal.id)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>
  );
};

const GuidelinesCard = ({ onDownloadTemplate }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">description</span> إرشادات تقديم المقترح
    </h3>
    <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
      <p>يجب أن يلتزم المقترح بالقالب الرسمي للكلية. يتضمن ذلك: ملخص تنفيذي، أهداف البحث، المراجعة الأدبية، المنهجية، الجدول الزمني والمراجع.</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>الحد الأقصى لعدد الصفحات: ١٢ صفحة (باستثناء المراجع)</li>
        <li>خط Manrope للعناوين، Lexend للنص الأساسي</li>
        <li>يتم الرفع بصيغة PDF مع توقيع المشرف الرقمي</li>
        <li>موعد التسليم النهائي: ٣٠ يونيو ٢٠٢٤</li>
      </ul>
    </div>
  </div>
);

const QuickNotesCard = ({ onDownloadTemplate }) => (
  <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-primary/20">
    <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3">ملاحظات سريعة</h3>
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <span className="material-symbols-outlined text-primary text-base">info</span>
        <p className="text-xs text-slate-700 dark:text-slate-300">يجب تقديم المقترح قبل بدء العمل الميداني.</p>
      </div>
      <div className="flex gap-3 items-start">
        <span className="material-symbols-outlined text-amber-500 text-base">schedule</span>
        <p className="text-xs text-slate-700 dark:text-slate-300">متوسط وقت مراجعة المقترح: ٧-١٠ أيام عمل.</p>
      </div>
      <button onClick={onDownloadTemplate} className="w-full mt-2 py-2 bg-white dark:bg-slate-800 text-primary font-bold rounded-xl border border-primary/30 hover:bg-primary/10 transition-colors text-sm">
        تنزيل القالب
      </button>
    </div>
  </div>
);

const StudentProposals = () => {
  const { data: myProposals = [], isLoading } = useMyProposals();

  const stats = {
    total: myProposals.length,
    underReview: myProposals.filter(p => String(p.status) === '0' || p.status === 'Pending').length,
    successRate: myProposals.length > 0 
        ? Math.round((myProposals.filter(p => String(p.status) === '1' || p.status === 'Approved').length / myProposals.length) * 100) 
        : 0
  };

  const getStatusInfo = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
      case '0':
      case 'Pending':
        return { status: 'pending', text: 'قيد المراجعة', color: 'amber', icon: 'hourglass_empty' };
      case '1':
      case 'Approved':
        return { status: 'accepted', text: 'مقبول', color: 'green', icon: 'article' };
      case '2':
      case 'Rejected':
        return { status: 'rejected', text: 'مرفوض', color: 'red', icon: 'assignment_late' };
      default:
        return { status: 'pending', text: status, color: 'slate', icon: 'info' };
    }
  };

  const formattedProposals = myProposals.map(p => {
    const info = getStatusInfo(p.status);
    return {
      id: p.reportID,
      title: p.title,
      submissionDate: new Date(p.submissionDate).toLocaleDateString('ar-EG'),
      status: info.status,
      statusText: info.text,
      statusColor: info.color,
      icon: info.icon,
      iconBg: info.color === 'amber' ? 'amber' : info.color === 'red' ? 'red' : 'primary',
      reason: p.feedback,
      hasBorderLeft: info.status === 'rejected'
    };
  });

  const [filterYear, setFilterYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewProposal = () => {
    // Navigate handled by React Router Link in the render
  };

  const handleViewReason = (id) => {
    const proposal = formattedProposals.find(p => p.id === id);
    const feedback = proposal?.reason || 'لا يوجد سبب محدد';
    alert(`ملاحظات رئيس القسم:\n\n${feedback}`);
  };

  const handleDownloadTemplate = () => {
    console.log("Downloading proposal template...");
  };

  const handleExportPDF = () => {
    console.log("Exporting proposals list to PDF...");
  };

  const handleFilterByYear = () => {
    console.log("Filtering proposals by academic year...");
  };

  const handleMoreOptions = (id) => {
    console.log("More options clicked for proposal ID:", id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">المقترحات</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">المقترحات الأكاديمية</h1>
            <p className="text-slate-500 max-w-lg">إدارة وتتبع مقترحات مشاريع التخرج. تأكد من استيفاء جميع المتطلبات وفقًا لإرشادات الكلية.</p>
          </div>
          <Link to="/student/proposals/create" className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            <span>مقترح جديد</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="إجمالي المقدم" value={stats.total} unit="مقترح" color="primary" />
          <StatsCard title="قيد المراجعة" value={stats.underReview} unit="قيد التنفيذ" color="amber" />
          <StatsCard title="نسبة النجاح" value={stats.successRate} unit="موافقة" color="primary" isGradient={true} />
        </div>

        {/* Proposals List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">سجل التقديمات</h3>
            <div className="flex gap-4">
              <button onClick={handleFilterByYear} className="text-xs font-bold text-primary hover:underline">تصفية حسب السنة</button>
              <button onClick={handleExportPDF} className="text-xs font-bold text-primary hover:underline">تصدير PDF</button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : formattedProposals.length > 0 ? (
            formattedProposals.map(proposal => (
                <ProposalCard 
                  key={proposal.id}
                  proposal={proposal}
                  onViewReason={handleViewReason}
                  onMoreOptions={handleMoreOptions}
                />
              ))
          ) : (
            <div className="text-center py-12 text-slate-500">لا توجد مقترحات مقدمة بعد.</div>
          )}
        </section>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <GuidelinesCard onDownloadTemplate={handleDownloadTemplate} />
          </div>
          <QuickNotesCard onDownloadTemplate={handleDownloadTemplate} />
        </div>
      </div>
    </div>
  );
};

export default StudentProposals;
