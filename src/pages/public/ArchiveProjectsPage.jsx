import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import archiveService from '../../services/archiveService';

const ArchiveProjectsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState(['جميع الأقسام']);
  const [years, setYears] = useState(['جميع السنوات']);
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('جميع الأقسام');
  const [selectedYear, setSelectedYear] = useState('جميع السنوات');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 9; // Show 9 items per page (cards)

  // Fetch departments and years on mount
  useEffect(() => {
    const fetchFilterMetadata = async () => {
      try {
        const [deptsData, yearsData] = await Promise.all([
          archiveService.getPublicDepartments(),
          archiveService.getPublicYears()
        ]);
        setDepartments(['جميع الأقسام', ...deptsData]);
        setYears(['جميع السنوات', ...yearsData]);
      } catch (error) {
        console.error('Error fetching filters data:', error);
      }
    };
    fetchFilterMetadata();
  }, []);

  // Fetch project list when filters or page changes
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await archiveService.getPublicArchiveProjects({
          page: currentPage,
          pageSize: pageSize,
          search: searchTerm,
          department: selectedDepartment,
          year: selectedYear
        });
        setProjects(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } catch (error) {
        console.error('Error fetching archived projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [currentPage, selectedDepartment, selectedYear]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Triggered automatically by selectedDepartment/selectedYear or manually via search
    // To trigger search, we re-run search.
    const fetchWithSearch = async () => {
      setLoading(true);
      try {
        const data = await archiveService.getPublicArchiveProjects({
          page: 1,
          pageSize: pageSize,
          search: searchTerm,
          department: selectedDepartment,
          year: selectedYear
        });
        setProjects(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching archived projects on search:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWithSearch();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen rtl" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <nav className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary font-display">GPM</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors ml-4">الرئيسية</Link>
            <Link to="/login" className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm shadow-md hover:bg-primary/90 transition-all">تسجيل دخول</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Banner */}
        <div className="text-right mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">الأرشيف الرقمي للمشاريع</span>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
            تصفح جميع مشاريع التخرج المؤرشفة
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            اكتشف الحلول المبتكرة والأبحاث المتميزة لطلابنا في جميع التخصصات والسنوات الأكاديمية السابقة.
          </p>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center mb-10">
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full pr-12 pl-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-200 text-right" 
              placeholder="ابحث عن مشروع، قسم، مشرف، أو فريق..." 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select 
              className="bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-lg border-none text-sm dark:text-slate-200 w-full sm:w-auto text-right"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
            >
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <select 
              className="bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-lg border-none text-sm dark:text-slate-200 w-full sm:w-auto text-right"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors">ابحث</button>
          </div>
        </form>

        {/* Dynamic Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 h-96 flex flex-col">
                <div className="bg-slate-200 dark:bg-slate-800 h-56 w-full"></div>
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="mt-auto h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">folder_open</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">لا توجد مشاريع مؤرشفة</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              لم نتمكن من العثور على أي مشاريع مطابقة للخيارات المحددة. جرب تغيير عبارة البحث أو الفلاتر.
            </p>
          </div>
        ) : (
          <>
            {/* Grid Layout of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project) => (
                <article key={project.archivedProjectID} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-slate-200 dark:border-slate-800 flex flex-col">
                  <div className="h-56 overflow-hidden relative">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={project.projectTitle} 
                      src={project.projectImagePath ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${project.projectImagePath}` : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoX5Axk_6lQxDO9_2B9Nn8W_In0o14UMv6b14LN5KnjkY_MislYxCdNHJJZJKPCnkilkNLtdJo7eEZTxR4y6bTouhNeGgOCPyv8VBhLcURGw3DeqyifD10Otrb3crr_bZLSdUYP9fp6VvF897_baj0wKz0C1nAIeJ6teZKCVHYifVyBb-YTb1_FEqiHRFKH57MVmofQ8jt64EIZRJeCBKTK-84b0pZnlMo8G66Ji-GtWhQONr1MKS2YgQ9jibk2b0z3DF52XE2jZD-'} 
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
                      {project.evaluationScore} / 100
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded mb-3">
                        {project.departmentName}
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-primary transition-colors">
                        {project.projectTitle}
                      </h3>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                        <span>المشرف: {project.supervisorName}</span>
                        <span>عام: {project.year}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/archive/${project.archivedProjectID}`)}
                        className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-primary hover:text-white text-primary rounded-lg font-bold text-sm transition-all"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  السابق
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ArchiveProjectsPage;
