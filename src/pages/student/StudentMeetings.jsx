import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CalendarDay = ({ day }) => {
  if (!day.isCurrentMonth) {
    return <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-slate-400 text-sm">{day.day}</div>;
  }

  if (day.hasMeeting) {
    if (day.isPrimary) {
      return (
        <div className="aspect-square bg-primary text-white rounded-lg p-2 font-bold shadow-md ring-2 ring-primary/20 text-sm relative">
          {day.day}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
        </div>
      );
    }
    return (
      <div className="aspect-square bg-white dark:bg-slate-800 rounded-lg p-2 font-semibold text-slate-700 dark:text-white border border-slate-100 dark:border-slate-700 text-sm relative">
        {day.day}
        <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 ${day.meetingType === 'amber' ? 'bg-amber-500' : 'bg-primary'} rounded-full`}></div>
      </div>
    );
  }

  return (
    <div className="aspect-square bg-white dark:bg-slate-800 rounded-lg p-2 font-semibold text-slate-700 dark:text-white border border-slate-100 dark:border-slate-700 text-sm">{day.day}</div>
  );
};

const MeetingNotesCard = ({ selectedMeeting, notes, onNotesChange, onSave, isSaving }) => (
  <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
    <div className="flex items-center gap-2 mb-5">
      <span className="material-symbols-outlined text-primary">edit_note</span>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">ملاحظات الاجتماع</h3>
    </div>
    <div className="mb-4">
      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">الاجتماع المحدد</label>
      <p className="text-sm font-semibold text-primary">{selectedMeeting}</p>
    </div>
    <textarea 
      value={notes}
      onChange={(e) => onNotesChange(e.target.value)}
      className="w-full flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200 min-h-[200px] focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none resize-none" 
      placeholder="اكتب ملاحظاتك هنا..."
    />
    <div className="mt-4 flex justify-end">
      <button 
        onClick={onSave}
        disabled={isSaving}
        className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:shadow-md transition-all disabled:opacity-50"
      >
        {isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
      </button>
    </div>
  </section>
);

const QuickTipCard = ({ tip }) => (
  <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800 relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-amber-700 dark:text-amber-400 text-[10px] uppercase font-black tracking-wider mb-1">تلميحة سريعة</p>
      <p className="text-amber-800 dark:text-amber-300 text-sm font-medium leading-tight">{tip}</p>
    </div>
    <span className="material-symbols-outlined absolute -left-4 -bottom-4 text-6xl opacity-10 rotate-12 text-amber-700">lightbulb</span>
  </section>
);

const MeetingRow = ({ meeting, onJoinMeeting, onViewMap }) => {
  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${meeting.isLocked ? 'opacity-70' : ''}`}>
      <td className="px-6 py-5">
        <p className="font-bold text-slate-800 dark:text-white">{meeting.date}</p>
        <p className="text-xs text-slate-500">{meeting.time}</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-base ${meeting.type === 'online' ? 'text-primary' : 'text-secondary'}`}>{meeting.icon}</span>
          <span className={`text-sm font-semibold ${meeting.type === 'online' ? 'text-primary' : 'text-secondary'}`}>{meeting.typeLabel}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{meeting.type === 'online' ? meeting.platform : meeting.location}</p>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <img alt={meeting.supervisorName} className="w-9 h-9 rounded-full object-cover shadow-sm" src={meeting.supervisorAvatar} />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{meeting.supervisorName}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{meeting.supervisorTitle}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-left">
        {meeting.action === 'join' && !meeting.isLocked && (
          <button 
            onClick={() => onJoinMeeting(meeting.id)}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            رابط الاجتماع <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        )}
        {meeting.action === 'map' && !meeting.isLocked && (
          <button 
            onClick={() => onViewMap(meeting.id)}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
          >
            عرض الخريطة <span className="material-symbols-outlined text-sm">map</span>
          </button>
        )}
        {meeting.isLocked && (
          <button disabled className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">
            رابط الاجتماع <span className="material-symbols-outlined text-sm">lock</span>
          </button>
        )}
      </td>
    </tr>
  );
};

const UpcomingMeetingsTable = ({ meetings, onJoinMeeting, onViewMap }) => (
  <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div className="p-6 pb-3">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">المناقشات القادمة</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">التاريخ والوقت</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">النوع</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">المشرف</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-left">الإجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {meetings.map(meeting => (
            <MeetingRow 
              key={meeting.id} 
              meeting={meeting} 
              onJoinMeeting={onJoinMeeting} 
              onViewMap={onViewMap} 
            />
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const StudentMeetings = () => {
  const [currentMonth, setCurrentMonth] = useState("سبتمبر ٢٠٢٤");
  // const [currentYear, setCurrentYear] = useState(2024);

  const [calendarDays, setCalendarDays] = useState([
    { day: "٢٩", isCurrentMonth: false, hasMeeting: false },
    { day: "٣٠", isCurrentMonth: false, hasMeeting: false },
    { day: "٣١", isCurrentMonth: false, hasMeeting: false },
    { day: "١", isCurrentMonth: true, hasMeeting: false },
    { day: "٢", isCurrentMonth: true, hasMeeting: false },
    { day: "٣", isCurrentMonth: true, hasMeeting: false },
    { day: "٤", isCurrentMonth: true, hasMeeting: false },
    { day: "٥", isCurrentMonth: true, hasMeeting: false },
    { day: "٦", isCurrentMonth: true, hasMeeting: true, isPrimary: true, meetingType: "primary" },
    { day: "٧", isCurrentMonth: true, hasMeeting: false },
    { day: "٨", isCurrentMonth: true, hasMeeting: false },
    { day: "٩", isCurrentMonth: true, hasMeeting: false },
    { day: "١٠", isCurrentMonth: true, hasMeeting: true, meetingType: "amber" },
    { day: "١١", isCurrentMonth: true, hasMeeting: false },
    { day: "١٢", isCurrentMonth: true, hasMeeting: false }
  ]);

  const [upcomingMeetings, setUpcomingMeetings] = useState([
    {
      id: 1,
      date: "الجمعة، ٦ سبتمبر",
      time: "١٠:٠٠ ص - ١١:٣٠ ص",
      type: "online",
      typeLabel: "اجتماع عبر الإنترنت",
      platform: "Google Meet",
      icon: "videocam",
      supervisorName: "د. سارة كولينز",
      supervisorTitle: "المشرف الرئيسي",
      supervisorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyTl5U9YeeZWcUhyFzSRFoOy_rR5HYRhqnI4xCKeHFG1iJMC21iuIr3Z4pc9mAaM_cLQdx2Dmc9qWiX-pdBRYPE-dT-sOTJuzL7n1fbHzShUBJqGTzul5N43HxzXW_dIjzXSU2vRB0Nhj6gkUz7Hf6UsLmKYanZZLoM004gTl4y6mrekPijnWD1fKajw3on7hW7cidDd8PLN1qlawJCf-1u7l10R_BXHlMtsZtNYETsaqiEOz_bNk0n5fCzZVpKSCxuH6beb3lnNI6",
      isActive: true,
      action: "join"
    },
    {
      id: 2,
      date: "الثلاثاء، ١٠ سبتمبر",
      time: "٠٢:٠٠ م - ٠٣:٠٠ م",
      type: "in_person",
      typeLabel: "حضوري",
      location: "معمل الكلية ٣٠٤",
      icon: "location_on",
      supervisorName: "أ.د. جيمس ميلر",
      supervisorTitle: "المستشار التقني",
      supervisorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLyt-JKROmN2gReQN8sfVY0_bSt82IcvFlvP8utWwCg-S8OAyAEJYpn-S6vQGJLN35dYlxmbp8U_mdPDQ2w6bp6heruV2SeZe-TFmvv58tp4slRQPsropIDoDUfdgDdWbO3sfXDkU8pI-y3ypMeeCfISNnnZAbGzdqZ-QNy2s48lxkXLtmTKAy2oaZJ8aj9R7X4fTKBNDEHT61L_zjXzFaEzo5wZpL6Az6B4OAAg9Aof_0cVUAk1owRW8qAXRoJOdbZuUazVZWmOZC",
      isActive: true,
      action: "map"
    },
    {
      id: 3,
      date: "الجمعة، ٢٠ سبتمبر",
      time: "١١:٠٠ ص - ١٢:٠٠ م",
      type: "online",
      typeLabel: "اجتماع عبر الإنترنت",
      platform: "Microsoft Teams",
      icon: "videocam",
      supervisorName: "د. سارة كولينز",
      supervisorTitle: "المشرف الرئيسي",
      supervisorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfv8ozYbDTeU6eS-XNHoxV9Fl5eKCxeKkoHRRI0GCNwsMVWcajFrwJji577dXK02Wcx5Uzar6wnSbgPW5T694-XYLKlEGzMHBXHZaoiq8qsNfrq2DmszLsEOBbMjow0KjmQN3YpIbA9PlRVwU0gk-1Ul5FZOwhYQRQpL9kqpKlKoXNP1K8aK0SHp_QXYLbpHqsB2eQl0gQ_RErnmcm2fG5wvhABFySkr9ceLnIh25u2IUSZ74YSRXY3sKhoqYNPEyPg_vSm80GbPES",
      isActive: false,
      action: "join",
      isLocked: true
    }
  ]);

  const [meetingNotes, setMeetingNotes] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState("مراجعة مقترح المشروع - ٦ سبتمبر");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const weekdays = ["ن", "ث", "ر", "خ", "ج", "س", "ح"];

  const handlePreviousMonth = () => {
    console.log("Navigating to previous month");
  };

  const handleNextMonth = () => {
    console.log("Navigating to next month");
  };

  const handleJoinMeeting = (id) => {
    console.log(`Joining meeting ${id}`);
  };

  const handleViewMap = (id) => {
    console.log(`Viewing map for meeting ${id}`);
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    setTimeout(() => {
      console.log("Notes saved:", meetingNotes);
      setIsSavingNotes(false);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    console.log("Downloading schedule PDF");
  };

  const handleSyncCalendar = () => {
    console.log("Syncing to external calendar");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/student/dashboard" className="hover:text-primary">الرئيسية</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-medium">الاجتماعات</span>
      </nav>
      
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">الجدول والمناقشة</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">اجتماعات المشروع</h1>
            <div className="h-1 w-20 bg-primary rounded-full mt-2"></div>
          </div>
          <Link to="/student/meetings/schedule" className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            جدولة اجتماع جديد
          </Link>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Calendar Section */}
          <section className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{currentMonth}</h2>
              <div className="flex gap-2">
                <button onClick={handlePreviousMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-slate-500">chevron_right</span>
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-slate-500">chevron_left</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {/* Weekday headers */}
              {weekdays.map(day => (
                <div key={day} className="text-[10px] font-bold uppercase tracking-wider text-slate-400 py-2">{day}</div>
              ))}
              {/* Calendar days */}
              {calendarDays.map((day, index) => (
                <CalendarDay key={index} day={day} />
              ))}
            </div>
          </section>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="flex-1">
              <MeetingNotesCard 
                selectedMeeting={selectedMeeting}
                notes={meetingNotes}
                onNotesChange={setMeetingNotes}
                onSave={handleSaveNotes}
                isSaving={isSavingNotes}
              />
            </div>
            <QuickTipCard 
              tip="قم دائمًا برفع مسودتك قبل ٢٤ ساعة من مزامنة المشرف."
            />
          </div>
        </div>

        {/* Upcoming Meetings Table */}
        <UpcomingMeetingsTable 
          meetings={upcomingMeetings}
          onJoinMeeting={handleJoinMeeting}
          onViewMap={handleViewMap}
        />

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 rounded-b-xl">
          <p className="text-xs font-medium text-slate-400">
            عرض {upcomingMeetings.length} من أصل ١٢ اجتماعًا مجدولاً
          </p>
          <div className="flex gap-5">
            <button onClick={handleDownloadPDF} className="text-xs font-bold text-primary hover:underline">
              تحميل جدول PDF
            </button>
            <button onClick={handleSyncCalendar} className="text-xs font-bold text-primary hover:underline">
              مزامنة مع التقويم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMeetings;
