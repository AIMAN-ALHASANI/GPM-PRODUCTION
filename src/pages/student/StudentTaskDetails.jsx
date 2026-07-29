import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const StatusBadge = ({ status, text }) => {
  const colorMap = {
    in_progress: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full ${colorMap[status] || 'bg-slate-100 text-slate-700'} text-[10px] font-bold uppercase tracking-wider`}>
      {text}
    </span>
  );
};

const PriorityBadge = ({ priority, text }) => {
  const colorMap = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    medium: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
    low: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full ${colorMap[priority] || 'bg-slate-100 text-slate-700'} text-[10px] font-bold uppercase tracking-wider`}>
      {text}
    </span>
  );
};

const ProgressSection = ({ progress, milestones, onMilestoneToggle }) => (
  <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">تقدم المهمة</h2>
      <span className="text-2xl font-extrabold text-primary">{progress}٪</span>
    </div>
    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mb-6 overflow-hidden">
      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }}></div>
    </div>
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">المعالم</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {milestones.map((milestone) => (
          <label key={milestone.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
            <input 
              checked={milestone.completed} 
              onChange={() => onMilestoneToggle(milestone.id)} 
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
              type="checkbox"
            />
            <span className={`text-sm ${milestone.completed ? 'text-slate-600 dark:text-slate-400 line-through opacity-60' : 'text-slate-700 dark:text-slate-300'}`}>
              {milestone.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  </section>
);

const DescriptionSection = ({ description, requirements }) => (
  <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">الوصف</h2>
    <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-3 text-sm whitespace-pre-wrap break-words overflow-wrap-break-word">
      <p>{description}</p>
      <p>المتطلبات الرئيسية:</p>
      <ul className="list-disc pr-6 space-y-1">
        {requirements.map((req, index) => (
          <li key={index}>{req}</li>
        ))}
      </ul>
    </div>
  </section>
);

const CommentsSection = ({ comments, newComment, onCommentChange, onSendComment }) => (
  <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">الأسئلة والتحديثات</h2>
    <div className="space-y-5 mb-6">
      {comments.map((comment) => (
        <div key={comment.id} className={`flex gap-3 ${comment.authorRole === 'student' ? 'flex-row-reverse' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {comment.authorInitial}
          </div>
          <div className={`space-y-1 ${comment.authorRole === 'student' ? 'text-left' : ''}`}>
            <div className={`flex items-center gap-3 ${comment.authorRole === 'student' ? 'justify-end' : ''}`}>
              {comment.authorRole === 'student' ? (
                <>
                  <span className="text-xs text-slate-500">{comment.time}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{comment.author}</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{comment.author}</span>
                  <span className="text-xs text-slate-500">{comment.time}</span>
                </>
              )}
            </div>
            <div className={`p-3 text-sm leading-relaxed ${
              comment.authorRole === 'student' 
                ? 'bg-primary/10 text-primary-800 dark:text-primary-200 rounded-xl rounded-tl-none' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl rounded-tr-none'
            }`}>
              {comment.content}
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* حقل إدخال التعليق */}
    <div className="relative">
      <textarea 
        value={newComment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 pr-12 min-h-[90px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none resize-none" 
        placeholder="اكتب تعليقاً أو تحديثاً..."
      />
      <button 
        onClick={onSendComment}
        className="absolute bottom-3 left-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">send</span>
      </button>
    </div>
  </section>
);

const TeamRolesCard = ({ roles }) => (
  <section className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">أدوار الفريق</h3>
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{roles.assignedBy.initial}</div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{roles.assignedBy.name}</p>
          <p className="text-xs text-primary font-medium">{roles.assignedBy.role}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{roles.assignedTo.initial}</div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{roles.assignedTo.name}</p>
          <p className="text-xs text-slate-500 font-medium">{roles.assignedTo.role}</p>
        </div>
      </div>
    </div>
  </section>
);

const StatusUpdateCard = ({ status, onStatusChange, options }) => (
  <section className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">تحديث الحالة</h3>
    <div className="relative">
      <select 
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none outline-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute left-3 top-2 pointer-events-none text-slate-400">expand_more</span>
    </div>
  </section>
);

const AttachmentsCard = ({ attachments, onDownload, onUpload }) => (
  <section className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">أصول البحث</h3>
      <span className="text-xs font-bold text-primary">{attachments.length === 2 ? 'ملفان' : `${attachments.length} ملفات`}</span>
    </div>
    <div className="space-y-3 mb-5">
      {attachments.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-${file.iconColor}-500`}>
              <span className="material-symbols-outlined text-lg">{file.icon}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">{file.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">{file.size} • {file.date}</p>
            </div>
          </div>
          <button onClick={() => onDownload(file.id)} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
        </div>
      ))}
    </div>
    <button onClick={onUpload} className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-primary/50 transition-all group">
      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">upload_file</span>
      <span className="text-xs font-semibold text-slate-500 group-hover:text-primary">رفع ملف جديد</span>
    </button>
  </section>
);

const TimeTrackingCard = ({ timeTracking }) => (
  <section className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl flex flex-col items-center text-center border border-slate-200 dark:border-slate-700">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">الوقت المستغرق</span>
    <h4 className="text-3xl font-extrabold text-primary mb-1">{timeTracking.hours} س</h4>
    <p className="text-xs text-slate-500 font-medium">تتبع منذ {timeTracking.since}</p>
    <div className="mt-4 flex gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
      <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
    </div>
  </section>
);

const StudentTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState({
    id: 1,
    title: "تصميم واجهة تسجيل الدخول",
    status: "in_progress",
    statusText: "قيد التنفيذ",
    statusColor: "indigo",
    priority: "high",
    priorityText: "أولوية عالية",
    priorityColor: "red",
    deadline: "١٢ مايو ٢٠٢٦",
    module: "نظام المصادقة",
    progress: 65,
    description: "تتضمن هذه المهمة إنشاء واجهة مستخدم عالية الدقة لبوابة المصادقة الرئيسية لمشروع التخرج. يجب أن يتوافق التصميم مع الجمالية الأساسية 'Scholar Architectural'، مع إعطاء الأولوية للطباعة الواضحة والشعور التحريري.",
    requirements: [
      "تصميم متجاوب للشاشات المحمولة والأجهزة اللوحية وأجهزة الكمبيوتر المكتبية.",
      "تنفيذ حالات إدخال المصادقة متعددة العوامل (MFA).",
      "التركيز على حالات معالجة الأخطاء (بيانات اعتماد غير صالحة، انتهاء مهلة الشبكة).",
      "دمج لوحة الألوان المؤسسية مع إمكانية الوصول عالية التباين."
    ],
    milestones: [
      { id: 1, text: "رسم الإطارات السلكية", completed: true },
      { id: 2, text: "اختيار لوحة الألوان", completed: true },
      { id: 3, text: "الأيقونات والأصول", completed: false },
      { id: 4, text: "النموذج عالي الدقة", completed: false }
    ],
    comments: [
      {
        id: 1,
        author: "د. سارة خليل",
        authorInitial: "د",
        authorRole: "supervisor",
        content: "يرجى التأكد من أن الطباعة تتبع الوزن 800 لخط Manrope. بدت المسودة الأخيرة خفيفة قليلاً على التأثير التحريري.",
        time: "أمس، ١٤:٣٠"
      },
      {
        id: 2,
        author: "يوسف أحمد",
        authorInitial: "ي",
        authorRole: "student",
        content: "تم الملاحظة د. سارة. لقد قمت بتحديث ملف Figma ليشمل أوزان Manrope الأثقل. أقوم الآن بالتحقق من الأيقونات.",
        time: "اليوم، ٠٩:١٢"
      }
    ],
    attachments: [
      { id: 1, name: "Design_Guidelines.pdf", size: "٤.٢ ميجابايت", date: "١٢ أكتوبر", type: "pdf", icon: "picture_as_pdf", iconColor: "red" },
      { id: 2, name: "Wireframe_v2.png", size: "١.٨ ميجابايت", date: "اليوم", type: "image", icon: "image", iconColor: "indigo" }
    ],
    teamRoles: {
      assignedBy: { name: "ليلى حسن", role: "قائد الفريق", initial: "ل" },
      assignedTo: { name: "يوسف أحمد", role: "معين إلى", initial: "ي" }
    },
    timeTracking: {
      hours: "١٢.٥",
      since: "١ مايو"
    }
  });

  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("in_progress");

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "completed", label: "مكتملة" }
  ];

  const handleStatusUpdate = (newStatus) => {
    console.log("Status updated to:", newStatus);
    setSelectedStatus(newStatus);
  };

  const handleMarkAsCompleted = () => {
    console.log("Marked as completed");
    setSelectedStatus("completed");
  };

  const handleRequestExtension = () => {
    console.log("Requested extension");
  };

  const handleDownloadAttachment = (attachmentId) => {
    console.log("Download attachment ID:", attachmentId);
  };

  const handleUploadAttachment = () => {
    console.log("Upload new attachment");
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    console.log("Send comment:", newComment);
    setNewComment("");
  };

  const handleMilestoneToggle = (milestoneId) => {
    console.log("Toggled milestone ID:", milestoneId);
    setTask(prev => {
      const updatedMilestones = prev.milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
      return { ...prev, milestones: updatedMilestones, progress: newProgress };
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/student/team" className="hover:text-primary">فريقي</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/student/tasks" className="hover:text-primary">مهامي</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">تفاصيل المهمة</span>
      </nav>

      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Task Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selectedStatus} text={statusOptions.find(o => o.value === selectedStatus)?.label} />
              <PriorityBadge priority={task.priority} text={task.priorityText} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                <span className="text-sm">الموعد النهائي: {task.deadline}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">folder</span>
                <span className="text-sm">الوحدة: {task.module}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRequestExtension} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-primary font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              طلب تمديد
            </button>
            <button onClick={handleMarkAsCompleted} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all">
              تحديد كمكتملة
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Progress Section */}
            <ProgressSection 
              progress={task.progress}
              milestones={task.milestones}
              onMilestoneToggle={handleMilestoneToggle}
            />
            
            {/* Description Section */}
            <DescriptionSection 
              description={task.description}
              requirements={task.requirements}
            />
            
            {/* Q&A/Comments Section */}
            <CommentsSection 
              comments={task.comments}
              newComment={newComment}
              onCommentChange={setNewComment}
              onSendComment={handleSendComment}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Team Roles Card */}
            <TeamRolesCard roles={task.teamRoles} />
            
            {/* Status Update Card */}
            <StatusUpdateCard 
              status={selectedStatus}
              onStatusChange={handleStatusUpdate}
              options={statusOptions}
            />
            
            {/* Attachments Card */}
            <AttachmentsCard 
              attachments={task.attachments}
              onDownload={handleDownloadAttachment}
              onUpload={handleUploadAttachment}
            />
            
            {/* Time Tracking Card */}
            <TimeTrackingCard timeTracking={task.timeTracking} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskDetails;
