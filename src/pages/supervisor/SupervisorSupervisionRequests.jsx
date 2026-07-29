import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const CategoryBadge = ({ category, color }) => {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    urgent: "bg-white/20 text-white"
  };

  const style = colorStyles[color] || colorStyles.primary;

  return (
    <span className={`${style} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
      {category}
    </span>
  );
};

const TeamMembers = ({ members, isUrgent }) => {
  const defaultBg = isUrgent ? "bg-white/20 border-white/30 text-white" : "bg-primary/20 border-white dark:border-slate-900 text-primary";
  
  return (
    <div className="flex -space-x-2">
      {members.map((member, idx) => (
        <div key={idx} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${defaultBg}`}>
          {member.initial}
        </div>
      ))}
    </div>
  );
};

const RequestCard = ({ request, onAccept, onReject, onViewProposal }) => (
  <div className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <CategoryBadge category={request.category} color={request.categoryColor} />
      <span className="text-xs text-slate-500 font-medium">{request.timeAgo}</span>
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">{request.title}</h3>
    <div className="flex items-center gap-3 mb-4">
      <TeamMembers members={request.members} isUrgent={false} />
      <div className="text-xs">
        <span className="font-bold text-slate-900 dark:text-white block">{request.teamName}</span>
        <span className="text-slate-500">{request.members.map(m => m.name).join('، ')}</span>
      </div>
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-5 leading-relaxed">
      {request.description}
    </p>
    <div className="space-y-2">
      <Link to={`/supervisor/projects/requests/${request.id}`} className="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-sm transition-all hover:bg-primary/90 block text-center">
        قبول الطلب
      </Link>
      <div className="grid grid-cols-2 gap-2">
        <Link to={`/supervisor/projects/requests/${request.id}`} className="py-2 bg-slate-100 dark:bg-slate-800 text-primary font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center">
          عرض المقترح
        </Link>
        <button onClick={() => onReject(request.id)} className="py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs rounded-lg transition-colors">
          رفض
        </button>
      </div>
    </div>
  </div>
);

const FeaturedRequestCard = ({ request, onAccept, onReject, onViewProposal }) => (
  <div className="group bg-gradient-to-br from-primary to-blue-600 p-6 rounded-xl text-white shadow-lg shadow-primary/20 transition-all">
    <div className="flex justify-between items-start mb-4">
      <CategoryBadge category={request.category} color={request.categoryColor} />
      <span className="text-xs text-white/60 font-medium">{request.timeAgo}</span>
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{request.title}</h3>
    <div className="flex items-center gap-3 mb-4">
      <TeamMembers members={request.members} isUrgent={true} />
      <div className="text-xs">
        <span className="font-bold text-white block">{request.teamName}</span>
        <span className="text-white/70">{request.members.map(m => m.name).join('، ')}</span>
      </div>
    </div>
    <p className="text-sm text-white/80 line-clamp-3 mb-5 leading-relaxed">
      {request.description}
    </p>
    <div className="space-y-2">
      <Link to={`/supervisor/projects/requests/${request.id}`} className="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm transition-all hover:bg-blue-50 block text-center">
        قبول الطلب
      </Link>
      <div className="grid grid-cols-2 gap-2">
        <Link to={`/supervisor/projects/requests/${request.id}`} className="py-2 bg-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/20 transition-colors text-center">
          عرض المقترح
        </Link>
        <button onClick={() => onReject(request.id)} className="py-2 text-white/70 hover:text-white font-bold text-xs rounded-lg transition-colors">
          رفض
        </button>
      </div>
    </div>
  </div>
);

const SupervisorSupervisionRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([
    {
      id: 1,
      title: "الخرائط العصبية الذاتية",
      category: "الذكاء الاصطناعي والروبوتات",
      categoryColor: "primary",
      timeAgo: "منذ يومين",
      teamName: "فريق Nexus",
      members: [
        { name: "ل. تشن", initial: "ل" },
        { name: "م. روسي", initial: "م" }
      ],
      description: "تطوير بنية شبكة عصبية لا مركزية للرسم الخرائطي الطبوغرافي في الوقت الفعلي باستخدام أسراب من الطائرات بدون طيار منخفضة التكلفة. التركيز على تقليل زمن الوصول.",
      isUrgent: false
    },
    {
      id: 2,
      title: "خوارزميات زمن الوصول لـ CRISPR",
      category: "المعلوماتية الحيوية",
      categoryColor: "blue",
      timeAgo: "منذ ٥ ساعات",
      teamName: "مجموعة Helix",
      members: [
        { name: "س. جاها", initial: "س" },
        { name: "م. أخرى", initial: "م" },
        { name: "ل. ثالث", initial: "ل" }
      ],
      description: "دراسة حسابية حول التنبؤ بنتائج التعبير الجيني باستخدام نماذج خوارزمية عالية الأداء لتقليل معدلات خطأ CRISPR التجريبية.",
      isUrgent: false
    },
    {
      id: 3,
      title: "تخفيف الحرارة الحضرية",
      category: "الأنظمة المستدامة",
      categoryColor: "urgent",
      timeAgo: "مراجعة عاجلة",
      teamName: "فريق Vertical Green",
      members: [{ name: "ك. تومسون", initial: "ك" }],
      description: "اقتراح مقياس جديد لتقييم فعالية الحدائق العمودية في الوديان الحضرية عالية الكثافة لمكافحة ارتفاع درجات الحرارة المحلية.",
      isUrgent: true,
      isFeatured: true
    },
    {
      id: 4,
      title: "تصحيح الأخطاء في الكيوبتات",
      category: "الحوسبة الكمية",
      categoryColor: "primary",
      timeAgo: "منذ يوم",
      teamName: "فريق Entangle",
      members: [
        { name: "أ. وونغ", initial: "أ" },
        { name: "ه. علي", initial: "ه" }
      ],
      description: "التحقيق في بنيات الكود السطحي الجديدة لتحسين تحمل الأخطاء في أنظمة الكيوبتات فائقة التوصيل. الإطار النظري تم تأسيسه بالفعل.",
      isUrgent: false
    },
    {
      id: 5,
      title: "تحليل الشتات الرقمي",
      category: "العلوم الاجتماعية",
      categoryColor: "blue",
      timeAgo: "الأسبوع الماضي",
      teamName: "بحث فردي",
      members: [{ name: "م. رودريغيز", initial: "م" }],
      description: "دراسة نوعية لكيفية توفير المجتمعات الافتراضية للدعم العاطفي للشباب المهاجر خلال فترات الانتقال.",
      isUrgent: false
    }
  ]);

  const [totalRequests, setTotalRequests] = useState(8);
  const [filter, setFilter] = useState("all");

  const handleAcceptRequest = (id) => {
    console.log(`Accepted request ${id}`);
    setRequests(prev => prev.filter(r => r.id !== id));
    setTotalRequests(prev => prev - 1);
  };

  const handleRejectRequest = (id) => {
    console.log(`Rejected request ${id}`);
    setRequests(prev => prev.filter(r => r.id !== id));
    setTotalRequests(prev => prev - 1);
  };

  const handleViewProposal = (id) => {
    navigate(`/supervisor/projects/requests/${id}`);
  };

  const handleFilterByField = () => {
    console.log('Filter by field dialog');
  };

  const handleBulkAction = () => {
    console.log('Bulk action dialog');
  };

  const handleInviteResearcher = () => {
    console.log('Invite researcher dialog');
  };

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link className="hover:text-primary" to="/supervisor/dashboard">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link className="hover:text-primary" to="/supervisor/projects">مشاريعي</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">طلبات الإشراف</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 block">الإشراف الأكاديمي</span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">طلبات الإشراف الواردة</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
              مراجعة وإدارة مقترحات البحوث من فرق الطلاب. لديك حالياً <span className="font-bold text-primary">{totalRequests} طلبات</span> في انتظار موافقتك الأكاديمية.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleFilterByField} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-primary font-bold text-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
              فلتر حسب المجال
            </button>
            <button onClick={handleBulkAction} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-primary font-bold text-sm transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
              إجراءات جماعية
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-8 border-b border-slate-200 dark:border-slate-800">
          <NavLink end to="/supervisor/projects" className={({ isActive }) =>
            isActive
              ? "px-6 py-3 text-sm font-bold border-b-2 border-primary text-primary bg-white dark:bg-slate-900 rounded-t-lg"
              : "px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          }>
            المشاريع الحالية
          </NavLink>
          <NavLink to="/supervisor/projects/requests" className={({ isActive }) =>
            isActive
              ? "px-6 py-3 text-sm font-bold border-b-2 border-primary text-primary bg-white dark:bg-slate-900 rounded-t-lg"
              : "px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
          }>
            طلبات الإشراف
            <span className="mr-2 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold">{totalRequests}</span>
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(request => (
            request.isFeatured ? (
              <FeaturedRequestCard 
                key={request.id} 
                request={request} 
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onViewProposal={handleViewProposal}
              />
            ) : (
              <RequestCard 
                key={request.id} 
                request={request} 
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onViewProposal={handleViewProposal}
              />
            )
          ))}

          {/* CTA Card - Invite Researcher */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">share</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">دعوة باحث</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 px-3">
              هل تعرف مرشح دكتوراه أو طالب متقدم يناسب مختبرك؟ أرسل دعوة إشراف مباشرة.
            </p>
            <button onClick={handleInviteResearcher} className="px-5 py-2 bg-primary text-white rounded-lg font-bold text-xs shadow-md hover:bg-primary/90">
              إرسال دعوة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorSupervisionRequests;
