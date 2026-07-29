import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupervisorMeetings, useCreateMeeting, useSupervisorTeams } from '../../hooks/useSupervisor';
import toast from 'react-hot-toast';

const SupervisorMeetings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teamIdFromUrl = searchParams.get('teamId');
  
  const { data: teams, isLoading: teamsLoading } = useSupervisorTeams();
  const { data: meetings, isLoading: meetingsLoading, isError: meetingsError } = useSupervisorMeetings(teamIdFromUrl);
  const createMeetingMutation = useCreateMeeting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    MeetingDate: '',
    Mode: 'Online',
    Notes: ''
  });

  const isValidTeam = teamIdFromUrl && Array.isArray(teams) && teams.some(t => t.teamID === parseInt(teamIdFromUrl));

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!isValidTeam) {
      toast.error('يرجى اختيار فريق صالح أولاً');
      return;
    }
    if (!formData.MeetingDate || !formData.Notes) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    createMeetingMutation.mutate({
      TeamID: parseInt(teamIdFromUrl),
      ...formData,
      MeetingDate: new Date(formData.MeetingDate).toISOString()
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ MeetingDate: '', Mode: 'Online', Notes: '' });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">الاجتماعات</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">إدارة اجتماعات الفريق ومتابعة الجلسات المجدولة.</p>
        </div>
        {isValidTeam && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            إنشاء اجتماع جديد
          </button>
        )}
      </div>

      <div className="mb-8">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">اختر الفريق</label>
        {teamsLoading ? (
          <div className="h-12 w-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(teams) && teams.map((team) => (
              <button
                key={team.teamID}
                onClick={() => navigate(`/supervisor/meetings?teamId=${team.teamID}`)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all border ${
                  teamIdFromUrl === String(team.teamID)
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                }`}
              >
                {team.teamName}
              </button>
            ))}
            {(!Array.isArray(teams) || teams.length === 0) && (
              <p className="text-sm text-slate-400 font-bold">لا توجد فرق متاحة</p>
            )}
          </div>
        )}
      </div>

      {!teamIdFromUrl ? (
        <div className="bg-white dark:bg-slate-900 p-20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">group</span>
          <p className="text-slate-500 font-bold text-lg">يرجى اختيار فريق من القائمة أعلاه لعرض الاجتماعات.</p>
        </div>
      ) : !isValidTeam && !teamsLoading ? (
        <div className="bg-white dark:bg-slate-900 p-20 rounded-3xl border border-dashed border-red-100 text-center">
          <span className="material-symbols-outlined text-6xl text-red-200 mb-4">warning</span>
          <p className="text-red-500 font-bold text-lg">هذا الفريق غير مرتبط بحسابك أو رقم الفريق غير صالح.</p>
        </div>
      ) : meetingsLoading ? (
        <div className="p-20 text-center text-slate-400 font-bold animate-pulse">جاري تحميل الاجتماعات...</div>
      ) : meetingsError ? (
        <div className="p-20 text-center text-red-500 font-bold">تعذر تحميل الاجتماعات</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(meetings) && meetings.map((meeting) => (
            <div key={meeting.meetingID} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                  meeting.mode === 'Online' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {meeting.mode === 'Online' ? 'عبر الإنترنت' : 'وجهاً لوجه'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{new Date(meeting.meetingDate).toLocaleDateString('ar-EG')}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-relaxed">{meeting.notes}</p>
              <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {new Date(meeting.meetingDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {(!Array.isArray(meetings) || meetings.length === 0) && (
            <div className="col-span-full p-20 text-center text-slate-400 font-bold">لا توجد اجتماعات مجدولة لهذا الفريق.</div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">إنشاء اجتماع</h2>
              <button onClick={() => setIsModalOpen(false)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateMeeting} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">التاريخ والوقت</label>
                <input 
                  type="datetime-local" 
                  value={formData.MeetingDate}
                  onChange={(e) => setFormData({ ...formData, MeetingDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">نوع الاجتماع</label>
                <select 
                  value={formData.Mode}
                  onChange={(e) => setFormData({ ...formData, Mode: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                >
                  <option value="Online">عبر الإنترنت (Online)</option>
                  <option value="Offline">وجهاً لوجه (Offline)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">ملاحظات / جدول الأعمال</label>
                <textarea 
                  value={formData.Notes}
                  onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                  placeholder="اكتب ملاحظات الاجتماع هنا..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={createMeetingMutation.isPending}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {createMeetingMutation.isPending ? 'جاري الحفظ...' : 'جدولة الاجتماع'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorMeetings;
