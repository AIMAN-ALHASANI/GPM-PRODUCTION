import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupervisorReports, useAddReportFeedback, useSupervisorTeams } from '../../hooks/useSupervisor';
import toast from 'react-hot-toast';

const SupervisorReports = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teamIdFromUrl = searchParams.get('teamId');

  const { data: teams, isLoading: teamsLoading } = useSupervisorTeams();
  const { data: reports, isLoading: reportsLoading, isError: reportsError } = useSupervisorReports(teamIdFromUrl);
  const addFeedbackMutation = useAddReportFeedback();

  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ Feedback: '', Status: 'Reviewed' });
  const [viewDescriptionReport, setViewDescriptionReport] = useState(null);

  const isValidTeam = teamIdFromUrl && Array.isArray(teams) && teams.some(t => t.teamID === parseInt(teamIdFromUrl));

  const handleOpenFeedback = (report) => {
    setSelectedReport(report);
    setFeedbackData({ 
      Feedback: report.feedback || report.Feedback || '', 
      Status: report.status || report.Status || 'Reviewed' 
    });
  };

  const handleOpenReportFile = (filePath) => {
    if (!filePath) {
      toast.error('ملف التقرير غير متوفر أو مساره غير صحيح');
      return;
    }
    window.open(filePath, '_blank', 'noopener,noreferrer');
  };

  const handleAddFeedback = (e) => {
    e.preventDefault();
    if (!feedbackData.Feedback.trim()) {
      toast.error('يرجى إضافة التغذية الراجعة');
      return;
    }

    addFeedbackMutation.mutate({
      reportId: selectedReport.reportID,
      payload: {
        Feedback: feedbackData.Feedback,
        Status: feedbackData.Status
      }
    }, {
      onSuccess: () => {
        setSelectedReport(null);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 text-right" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">تقارير الفريق</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">مراجعة التقارير المرفوعة من قبل الفريق وإضافة التغذية الراجعة.</p>
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
                onClick={() => navigate(`/supervisor/reports?teamId=${team.teamID}`)}
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
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">description</span>
          <p className="text-slate-500 font-bold text-lg">يرجى اختيار فريق من القائمة أعلاه لعرض التقارير.</p>
        </div>
      ) : !isValidTeam && !teamsLoading ? (
        <div className="bg-white dark:bg-slate-900 p-20 rounded-3xl border border-dashed border-red-100 text-center">
          <span className="material-symbols-outlined text-6xl text-red-200 mb-4">warning</span>
          <p className="text-red-500 font-bold text-lg">هذا الفريق غير مرتبط بحسابك أو رقم الفريق غير صالح.</p>
        </div>
      ) : reportsLoading ? (
        <div className="p-20 text-center text-slate-400 font-bold animate-pulse">جاري تحميل التقارير...</div>
      ) : reportsError ? (
        <div className="p-20 text-center text-red-500 font-bold">تعذر تحميل التقارير</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.isArray(reports) && reports.map((report) => {
            const reportID = report.reportID || report.ReportID;
            const title = report.title || report.Title;
            const description = report.description || report.Description;
            const status = report.status || report.Status;
            const reportType = report.reportType || report.ReportType;
            const submissionDate = report.submissionDate || report.SubmissionDate || report.createdAt || report.CreatedAt;
            const filePath = report.filePath || report.FilePath;
            const projectTitle = report.projectTitle || report.ProjectTitle;
            const teamName = report.teamName || report.TeamName;
            const submittedBy = report.submittedBy || report.SubmittedBy;
            const feedback = report.feedback || report.Feedback;

            return (
              <div key={reportID} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900' :
                      status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900' :
                      'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900'
                    }`}>
                      {status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewDescriptionReport(report)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">visibility</span>
                        عرض الوصف
                      </button>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {reportType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">{description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">الفريق</p>
                      <p className="font-bold">{teamName || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">المشروع</p>
                      <p className="font-bold truncate" title={projectTitle}>{projectTitle || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">بواسطة</p>
                      <p className="font-bold">{submittedBy || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px]">تاريخ التقديم</p>
                      <p className="font-bold tabular-nums">
                        {submissionDate ? new Date(submissionDate).toLocaleDateString('ar-EG') : '---'}
                      </p>
                    </div>
                  </div>

                  {feedback && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400">ملاحظاتك السابقة:</p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-350 mt-0.5">{feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleOpenReportFile(filePath)}
                    className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    فتح ملف التقرير
                  </button>
                  <button 
                    onClick={() => handleOpenFeedback(report)}
                    className="flex-1 py-2 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">rate_review</span>
                    إضافة ملاحظات
                  </button>
                </div>
              </div>
            );
          })}
          {(!Array.isArray(reports) || reports.length === 0) && (
            <div className="col-span-full bg-white dark:bg-slate-900 p-20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 mb-4">description</span>
              <p className="text-slate-500 font-bold text-lg">لا توجد تقارير لهذا الفريق.</p>
            </div>
          )}
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">إضافة ملاحظات</h2>
              <button onClick={() => setSelectedReport(null)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddFeedback} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">الحالة</label>
                <select 
                  value={feedbackData.Status}
                  onChange={(e) => setFeedbackData({ ...feedbackData, Status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                >
                  <option value="Approved">مقبول (Approved)</option>
                  <option value="Rejected">مرفوض (Rejected)</option>
                  <option value="Reviewed">تمت المراجعة (Reviewed)</option>
                  <option value="NeedsRevision">بحاجة لتعديل (NeedsRevision)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">التغذية الراجعة</label>
                <textarea 
                  value={feedbackData.Feedback}
                  onChange={(e) => setFeedbackData({ ...feedbackData, Feedback: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none"
                  placeholder="اكتب ملاحظاتك وتقييمك للتقرير هنا..."
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={addFeedbackMutation.isPending}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {addFeedbackMutation.isPending ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewDescriptionReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">وصف التقرير: {viewDescriptionReport.title || viewDescriptionReport.Title}</h2>
              <button onClick={() => setViewDescriptionReport(null)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div 
                className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                {viewDescriptionReport.description || viewDescriptionReport.Description || 'لا يوجد وصف متاح لهذا التقرير.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorReports;
