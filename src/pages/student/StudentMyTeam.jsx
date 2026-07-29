import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const StatusBadge = ({ status }) => (
  <div className="flex items-center justify-start gap-1.5">
    <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
    <span className={`text-xs font-medium ${status === 'online' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'}`}>
      {status === 'online' ? 'متصل' : 'غير متصل'}
    </span>
  </div>
);

const RoleBadge = ({ roleType }) => (
  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
    roleType === 'leader' 
      ? 'bg-primary/10 text-primary' 
      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
  }`}>
    {roleType === 'leader' ? 'قائد' : 'عضو'}
  </span>
);

const TeamInfoCard = ({ team }) => (
  <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
    <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{team.name}</h2>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-center">
          <span className="block text-2xl font-bold">{team.capacity.current}/{team.capacity.max}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">السعة</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-1">عنوان المشروع</span>
          <p className="text-base font-medium leading-tight">{team.projectTitle}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-1">قائد الفريق</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <p className="text-lg font-bold">{team.leader.name}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TeamMembersTable = ({ members }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">قائمة الأعضاء</h3>
      <div className="px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
        الأعضاء النشطون
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
            <th className="pb-3 px-3 font-bold text-right">الاسم</th>
            <th className="pb-3 px-3 font-bold text-right">الرقم الجامعي</th>
            <th className="pb-3 px-3 font-bold text-right">الدور</th>
            <th className="pb-3 px-3 font-bold text-left">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {members.map(member => (
            <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-4 px-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{member.initial}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-3 text-sm font-mono tracking-tight text-slate-600 dark:text-slate-400">{member.universityId}</td>
              <td className="py-4 px-3">
                <RoleBadge roleType={member.roleType} />
              </td>
              <td className="py-4 px-3 text-left">
                <StatusBadge status={member.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SentInvitationsCard = ({ invitations }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">الدعوات المرسلة</h3>
    <div className="space-y-3">
      {invitations.map(invitation => (
        <div key={invitation.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{invitation.initial}</div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{invitation.name}</p>
              <p className="text-[10px] text-slate-500">{invitation.submittedDate}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
            invitation.statusColor === 'amber' 
              ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' 
              : 'text-red-600 bg-red-50 dark:bg-red-900/20'
          }`}>
            {invitation.statusText}
          </span>
        </div>
      ))}
    </div>
    <p className="mt-4 text-center text-xs text-slate-500 italic">يمكن لقائد الفريق فقط إدارة طلبات الانتظار.</p>
  </div>
);

const IncomingInvitationsCard = ({ invitations, onAccept, onReject }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
    <div className="absolute top-3 right-3">
      <span className="flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
      </span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">الدعوات الواردة</h3>
    
    {invitations.map(invitation => (
      <div key={invitation.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-r-4 border-primary">
        <div className="flex items-start gap-4 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{invitation.teamName}</h4>
            <p className="text-xs text-slate-500">القائد: {invitation.leaderName}</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">"{invitation.message}"</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onReject(invitation.id)} className="bg-slate-100 dark:bg-slate-800 text-primary py-2 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">رفض</button>
          <button onClick={() => onAccept(invitation.id)} className="bg-primary text-white py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-primary/90 transition-colors">قبول الدعوة</button>
        </div>
      </div>
    ))}

    <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
      <span>إجمالي الدعوات: {invitations.length < 10 ? `٠${invitations.length}` : invitations.length}</span>
      <span>{invitations.length > 0 ? invitations[0].expiresIn : ''}</span>
    </div>
  </div>
);

const StudentMyTeam = () => {
  const [team, setTeam] = useState({
    name: "فريق المبتكرون",
    projectId: "#7724-B",
    capacity: { current: 4, max: 6 },
    projectTitle: "الذكاء الاصطناعي في الأنظمة التعليمية الجامعية",
    leader: {
      name: "د. إيلينا ميخائيلوفا",
      title: "باحث رئيسي"
    },
    lastActivity: "منذ ساعتين"
  });

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "د. إيلينا ميخائيلوفا",
      role: "باحث رئيسي",
      roleType: "leader",
      universityId: "STU-10294",
      status: "online",
      initial: "د",
      avatarBg: "primary"
    },
    {
      id: 2,
      name: "سارة جميل",
      role: "محللة بيانات",
      roleType: "member",
      universityId: "STU-44821",
      status: "offline",
      initial: "س",
      avatarBg: "primary"
    },
    {
      id: 3,
      name: "أحمد السيد",
      role: "مصمم واجهات",
      roleType: "member",
      universityId: "STU-22910",
      status: "online",
      initial: "أ",
      avatarBg: "primary"
    }
  ]);

  const [sentInvitations, setSentInvitations] = useState([
    {
      id: 1,
      name: "مارك وودز",
      initial: "م",
      submittedDate: "منذ يومين",
      status: "pending",
      statusText: "قيد الانتظار",
      statusColor: "amber"
    },
    {
      id: 2,
      name: "ليلى رشيد",
      initial: "ل",
      submittedDate: "منذ أسبوع",
      status: "rejected",
      statusText: "مرفوض",
      statusColor: "red"
    }
  ]);

  const [incomingInvitations, setIncomingInvitations] = useState([
    {
      id: 1,
      teamName: "مختبر الديناميكا العصبية",
      leaderName: "د. توماس أريس",
      message: "لقد رأينا عملك الأخير في نظام لوحة التحكم ويسعدنا أن نطلب منك قيادة تصميم واجهة مشروع تصور الشبكات العصبية الخاص بنا.",
      expiresIn: "تنتهي بعد ٣ أيام"
    }
  ]);

  const handleAcceptInvitation = (id) => {
    console.log("Accepted invitation ID:", id);
    setIncomingInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const handleRejectInvitation = (id) => {
    console.log("Rejected invitation ID:", id);
    setIncomingInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">فريقي</span>
      </nav>
      
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-primary font-bold mb-2 block">مركز التعاون</span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">فريقي</h1>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-500">آخر نشاط: {team.lastActivity}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex gap-8">
            <NavLink 
              to="/student/team" 
              end
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold"
                  : "flex items-center gap-2 px-1 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              }
            >
              <span className="material-symbols-outlined">group</span>
              الفريق
            </NavLink>
            <NavLink 
              to="/student/tasks" 
              className={({ isActive }) =>
                isActive
                  ? "flex items-center gap-2 px-1 py-3 text-primary border-b-2 border-primary font-semibold"
                  : "flex items-center gap-2 px-1 py-3 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
              }
            >
              <span className="material-symbols-outlined">assignment</span>
              مهامي
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">3</span>
            </NavLink>
          </nav>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Team Info & Members */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* Team Info Card */}
            <TeamInfoCard team={team} />
            
            {/* Team Members Table */}
            <TeamMembersTable members={teamMembers} />
          </div>

          {/* Right Column - Invitations */}
          <div className="col-span-12 lg:col-span-5 space-y-8">
            {/* Sent Invitations Card */}
            <SentInvitationsCard invitations={sentInvitations} />
            
            {/* Incoming Invitations Card */}
            <IncomingInvitationsCard 
              invitations={incomingInvitations}
              onAccept={handleAcceptInvitation}
              onReject={handleRejectInvitation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMyTeam;
