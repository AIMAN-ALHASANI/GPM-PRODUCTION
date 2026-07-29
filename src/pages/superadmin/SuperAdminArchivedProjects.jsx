import React, { useState, useEffect } from 'react';
import superAdminService from '../../services/superAdminService';

const SuperAdminArchivedProjects = () => {
  const [archived, setArchived] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  useEffect(() => {
    const fetchArchived = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await superAdminService.getRecentArchivedProjects(30);
        if (res.success) {
          setArchived(res.data);
        } else {
          setError(res.message || 'فشل في جلب المشاريع مؤرشفة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء الاتصال بالنظام لجلب المشاريع المؤرشفة.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchived();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">خطأ في التحميل</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">المشاريع المؤرشفة بالنظام</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">عرض المشاريع التي أكملت رحلتها الأكاديمية بنجاح وحصلت على التقييمات النهائية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archived?.map((proj) => (
          <div key={proj.archivedProjectID} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            {/* Project Image */}
            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
              {proj.projectImagePath ? (
                <img
                  src={getFileUrl(proj.projectImagePath)}
                  alt={proj.projectTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-2">
                  <span className="material-symbols-outlined text-5xl">image</span>
                  <span className="text-xs font-bold">معاينة غير متوفرة</span>
                </div>
              )}
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white shadow-sm tabular-nums">
                السنة: {proj.year}
              </div>
            </div>

            {/* Content Info */}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                  {proj.departmentName}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-3 line-clamp-2 leading-snug">
                  {proj.projectTitle}
                </h3>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">تاريخ الأرشفة</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                    {new Date(proj.uploadedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">الدرجة النهائية</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">
                    {proj.evaluationScore} / 100
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {(!archived || archived.length === 0) && (
          <div className="col-span-full text-center py-20 text-slate-400">لا توجد مشاريع مؤرشفة مسجلة في النظام حالياً</div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminArchivedProjects;
