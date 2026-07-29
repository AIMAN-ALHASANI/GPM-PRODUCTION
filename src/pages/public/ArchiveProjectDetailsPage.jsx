import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import archiveService from '../../services/archiveService';

const ArchiveProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const data = await archiveService.getPublicArchiveProjectDetails(id);
        setProject(data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen rtl flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen rtl flex flex-col items-center justify-center p-6" dir="rtl">
        <span className="material-symbols-outlined text-7xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold mb-2">المشروع غير موجود</h2>
        <p className="text-slate-500 mb-6">المعذرة، لم نتمكن من العثور على تفاصيل هذا المشروع.</p>
        <button onClick={() => navigate('/archive')} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold">العودة للأرشيف</button>
      </div>
    );
  }

  const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  const imageUrl = project.projectImagePath 
    ? getFileUrl(project.projectImagePath)
    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoX5Axk_6lQxDO9_2B9Nn8W_In0o14UMv6b14LN5KnjkY_MislYxCdNHJJZJKPCnkilkNLtdJo7eEZTxR4y6bTouhNeGgOCPyv8VBhLcURGw3DeqyifD10Otrb3crr_bZLSdUYP9fp6VvF897_baj0wKz0C1nAIeJ6teZKCVHYifVyBb-YTb1_FEqiHRFKH57MVmofQ8jt64EIZRJeCBKTK-84b0pZnlMo8G66Ji-GtWhQONr1MKS2YgQ9jibk2b0z3DF52XE2jZD-';

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen rtl" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <nav className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary font-display">GPM</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/archive" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors ml-4">تصفح المشاريع</Link>
            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-md hover:bg-primary/90 transition-all">تسجيل دخول</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-primary font-bold mb-8 hover:opacity-80 transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
          <span>الرجوع</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info Column (Left on RTL, right visual) */}
          <div className="lg:col-span-2 space-y-8 text-right">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded mb-4">
                {project.departmentName}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                {project.projectTitle}
              </h1>
            </div>

            {/* Showcase Image */}
            <div className="rounded-2xl overflow-hidden shadow-md max-h-[450px] border border-slate-200 dark:border-slate-800">
              <img 
                className="w-full h-full object-cover aspect-[16/9]" 
                alt={project.projectTitle} 
                src={imageUrl} 
              />
            </div>

            {/* Objective Section */}
            <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-r-4 border-primary pr-3">
                أهداف المشروع
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                {project.projectObjective}
              </p>
            </section>

            {/* Abstract Section */}
            {project.projectAbstract && (
              <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white border-r-4 border-primary pr-3">
                  الملخص التنفيذي
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                  {project.projectAbstract}
                </p>
              </section>
            )}

            {/* Archived Summary Section */}
            {project.summary && project.summary !== project.projectAbstract && (
              <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white border-r-4 border-primary pr-3">
                  ملخص الأرشيف
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
                  {project.summary}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar Metadata Column (Right on RTL, left visual) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-right">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                تفاصيل الأرشفة
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-400 block mb-1">تقييم المشروع</span>
                  <span className="font-bold text-slate-800 dark:text-white text-lg block text-primary">
                    {project.evaluationScore} / 100
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">اسم الفريق</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-base block">
                    {project.teamName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">المشرف الأكاديمي</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-base block">
                    {project.supervisorName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">القسم العلمى</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-base block">
                    {project.departmentName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">السنة الأكاديمية</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-base block">
                    {project.year}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">تاريخ الأرشفة</span>
                  <span className="font-semibold text-slate-800 dark:text-white text-base block">
                    {new Date(project.archiveDate).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Attached File Card */}
            {(() => {
              const fileUrl = getFileUrl(
                project.projectFileUrl ||
                project.ProjectFileUrl ||
                (project.filePath && project.filePath !== 'no-file-provided.pdf' ? project.filePath : null)
              );
              return (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-right space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-white">الملف المرفق</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    الملف الرسمي للمشروع المؤرشف، يتضمن التقرير النهائي والوثائق المرفقة من قبل إدارة النظام.
                  </p>
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white hover:bg-primary/95 rounded-lg font-bold text-sm shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>عرض الملف المرفق</span>
                    </a>
                  ) : (
                    <div className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-center text-xs font-semibold">
                      لا يوجد ملف متاح
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArchiveProjectDetailsPage;
