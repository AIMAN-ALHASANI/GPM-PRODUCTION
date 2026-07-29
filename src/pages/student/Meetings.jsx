import React, { useState, useEffect } from 'react';
import useMyTeam from '../../hooks/useMyTeam';
import meetingService from '../../services/meetingService';
import NoTeamGate from '../../components/common/NoTeamGate';
import { formatDateTime } from '../../utils/formatNumber';

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

/**
 * Backend MeetingResponseDto fields:
 *   { MeetingID, MeetingDate, Mode, Notes, TeamName, RequestedBy }
 *
 * IMPORTANT: POST /meetings is restricted to Supervisor role only.
 * Students CANNOT create meetings — this page is read-only for students.
 * Meetings are created by the supervisor and will appear here automatically.
 *
 * Field notes:
 * - MeetingDate: DateTime string (use for display)
 * - Mode: "Online" | "Offline"
 * - RequestedBy: full name string of who created it (supervisor)
 * - NO: id, status, scheduledAt, supervisorName
 */

const Meetings = () => {
  const { hasTeam, isLoading: teamLoading } = useMyTeam();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await meetingService.getMyMeetings();
      
      // Normalize fields
      const normalized = (Array.isArray(data) ? data : []).map(m => {
        const meetingID = m?.meetingID ?? m?.MeetingID;
        
        // Casing & fallback mapping
        const meetingDate = m?.meetingDate ?? m?.MeetingDate;
        const mode = (m?.mode ?? m?.Mode) || 'غير محدد';
        const notes = (m?.notes ?? m?.Notes) || 'لا توجد ملاحظات';
        const teamName = (m?.teamName ?? m?.TeamName) || 'غير محدد';
        const requestedBy = (m?.requestedBy ?? m?.RequestedBy) || 'غير معروف';

        return { meetingID, meetingDate, mode, notes, teamName, requestedBy };
      });

      setMeetings(normalized);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تحميل الاجتماعات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasTeam) loadMeetings();
  }, [hasTeam]);

  if (teamLoading) return <Spinner text="جاري تحميل معلومات الفريق..." />;
  if (!hasTeam)   return <NoTeamGate featureName="عرض الاجتماعات" />;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">الاجتماعات</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            الاجتماعات المجدولة من قِبل مشرفك
          </p>
        </div>
      </header>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
        <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">info</span>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          الاجتماعات يتم جدولتها من قِبل مشرف الفريق. ستظهر هنا تلقائياً عند إضافتها.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-500">error</span>
          <span>تعذر تحميل الاجتماعات: {error}</span>
        </div>
      )}

      {isLoading ? <Spinner text="جاري تحميل الاجتماعات..." /> : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {meetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                event_busy
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                لا توجد اجتماعات
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 max-w-xs text-center leading-relaxed">
                لم يتم جدولة أي اجتماعات لفريقك حتى الآن.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    {['التاريخ والوقت', 'طريقة الاجتماع', 'الفريق', 'المُنظِّم', 'ملاحظات'].map(h => (
                      <th key={h} className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {meetings.map((m, idx) => {
                    // Safe date formatter as requested in 9)
                    let formattedDate = '—';
                    if (m.meetingDate) {
                      try {
                        formattedDate = formatDateTime(m.meetingDate, { dateStyle: 'medium', timeStyle: 'short' });
                      } catch (dateErr) {
                        formattedDate = m.meetingDate;
                      }
                    }

                    return (
                      <tr key={m.meetingID ?? idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.mode === 'Online'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            <span className="material-symbols-outlined text-xs">
                              {m.mode === 'Online' ? 'videocam' : 'meeting_room'}
                            </span>
                            {m.mode === 'Online' ? 'أونلاين' : 'حضوري'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {m.teamName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {m.requestedBy}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px]">
                          <span className="truncate block" title={m.notes}>{m.notes}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Meetings;
